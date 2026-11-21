import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { editProduct } from "@/actions/admin/bar-management/editProduct";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockFindUnique = prisma.product.findUnique as unknown as Mock;
const mockUpdate = prisma.product.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type EditProductInput = Parameters<typeof editProduct>[0];

const productId = "550e8400-e29b-41d4-a716-446655440000";
const oldImageUrl = "https://blob.vercel-storage.com/1600000000000-old.png";
const newImageUrl = "https://blob.vercel-storage.com/1700000000000-heineken.png";

const buildImage = () => new File(["image"], "heineken.png", { type: "image/png" });

// Sem o campo image a imagem não é trocada. Ajuste os valores de category e status caso o schema use outros

const buildInput = (overrides: Partial<EditProductInput> = {}): EditProductInput => ({
  productId,
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  price: 12.5,
  status: "active",
  ...overrides,
});

// O price do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDbProduct = (image: string) => ({
  id: productId,
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image,
  price: { toNumber: () => 12.5 },
  status: "active",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

const buildExpectedProduct = (image: string) => ({
  id: productId,
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image,
  price: 12.5,
  status: "active",
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
});

const baseData = {
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  price: 12.5,
  status: "active",
};

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue({ image: oldImageUrl });
  mockPut.mockResolvedValue({ url: newImageUrl });
  mockDel.mockResolvedValue(undefined);
  mockUpdate.mockImplementation(async ({ data }) => buildDbProduct(data.image ?? oldImageUrl));
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await editProduct(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

// Ajuste os valores inválidos conforme as regras do editProductSchema

test.each([
  ["an id that is not a uuid", { productId: "not-a-uuid" }],
  ["an empty name", { name: "" }],
  ["an unknown category", { category: "invalid" }],
  ["a negative price", { price: -1 }],
  ["a negative quantity", { quantity: -1 }],
  ["an image that is not a file", { image: "not a file" }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await editProduct(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

/* - Testando a edição sem troca de imagem - */

test("should update only the product data and skip the blob when there is no new image", async () => {
  await editProduct(buildInput());

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: productId }, data: baseData });
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a edição com troca de imagem - */

test("should upload the new image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await editProduct(buildInput({ image: buildImage() }));

  expect(mockPut).toHaveBeenCalledWith("1700000000000-heineken.png", expect.any(File), { access: "public" });
});

test("should look for the old image and update the product with the new image url", async () => {
  await editProduct(buildInput({ image: buildImage() }));

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: productId }, select: { image: true } });
  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: productId }, data: { ...baseData, image: newImageUrl } });
});

test("should remove the old image from the blob only after the product is updated", async () => {
  await editProduct(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldImageUrl);
  expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should not try to remove an old image when the product had none registered", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await editProduct(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedProduct(newImageUrl));
  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return the edited product when removing the old image fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await editProduct(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedProduct(newImageUrl));
});

/* - Testando o resultado - */

test.each([
  ["with a new image", { image: buildImage() }, newImageUrl],
  ["without a new image", {}, oldImageUrl],
])("should return the edited product with the price as a number and the dates as strings %s", async (_description, overrides, expectedImage) => {
  const result = await editProduct(buildInput(overrides));

  expect(result).toEqual(buildExpectedProduct(expectedImage));
});

/* - Testando as falhas antes da edição - */

test.each([
  ["looking for the old image", () => mockFindUnique],
  ["uploading the new image", () => mockPut],
])("should return false and skip the update and the cleanup when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await editProduct(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco na edição - */

test.each([
  ["name", "name_is_not_unique"],
  ["description", "description_is_not_unique"],
])("should return %s_is_not_unique when the %s already exists", async (field, expected) => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2002", { target: [field] }));

  const result = await editProduct(buildInput());

  expect(result).toBe(expected);
});

test.each([
  ["a unique error from another field", buildPrismaError("P2002", { target: ["image"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  const result = await editProduct(buildInput());

  expect(result).toBe(false);
});

/* - Testando a limpeza da imagem nova quando a edição falha - */

test.each([
  ["a unique name error", buildPrismaError("P2002", { target: ["name"] })],
  ["a unique description error", buildPrismaError("P2002", { target: ["description"] })],
  ["an unknown error", new Error("db error")],
])("should delete only the new image and keep the old one when the update fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  await editProduct(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(newImageUrl);
});

test("should not delete anything when the update fails and there is no new image", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  await editProduct(buildInput());

  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return the error result when deleting the new image also fails", async () => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await editProduct(buildInput({ image: buildImage() }));

  expect(result).toBe("name_is_not_unique");
});
