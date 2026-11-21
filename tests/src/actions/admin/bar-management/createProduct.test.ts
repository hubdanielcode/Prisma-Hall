import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { createProduct } from "@/actions/admin/bar-management/createProduct";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/internal/prismaNamespace";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockCreate = prisma.product.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type CreateProductInput = Parameters<typeof createProduct>[0];

const blobUrl = "https://blob.vercel-storage.com/1700000000000-heineken.png";

// Ajuste os valores de category e status caso o schema use outros

const buildInput = (overrides: Partial<CreateProductInput> = {}): CreateProductInput => ({
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image: new File(["image"], "heineken.png", { type: "image/png" }),
  price: 12.5,
  status: "active",
  ...overrides,
});

// O price do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDatabaseProduct = () => ({
  id: "product 1",
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image: blobUrl,
  price: { toNumber: () => 12.5 },
  status: "active",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockPut.mockResolvedValue({ url: blobUrl });
  mockDel.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue(buildDatabaseProduct());
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await createProduct(buildInput());

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

// Ajuste os valores inválidos conforme as regras do createProductSchema

test.each([
  ["an empty name", { name: "" }],
  ["an unknown category", { category: "invalid" }],
  ["a negative price", { price: -1 }],
  ["a negative quantity", { quantity: -1 }],
  ["an image that is not a file", { image: "not a file" }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await createProduct(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando o upload e a consulta ao banco - */

test("should upload the image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await createProduct(buildInput());

  expect(mockPut).toHaveBeenCalledWith("1700000000000-heineken.png", expect.any(File), { access: "public" });
});

test("should create the product with the data from the input and the uploaded image url", async () => {
  await createProduct(buildInput());

  expect(mockCreate).toHaveBeenCalledWith({
    data: {
      name: "Heineken",
      description: "Cerveja long neck 330ml",
      category: "beers",
      quantity: 10,
      image: blobUrl,
      price: 12.5,
      status: "active",
    },
  });
});

test("should return false and skip the database and the cleanup when the upload fails", async () => {
  mockPut.mockRejectedValue(new Error("blob error"));

  const result = await createProduct(buildInput());

  expect(result).toBe(false);
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should return the created product with the price as a number and the dates as strings", async () => {
  const result = await createProduct(buildInput());

  expect(result).toEqual({
    id: "product 1",
    name: "Heineken",
    description: "Cerveja long neck 330ml",
    category: "beers",
    quantity: 10,
    image: blobUrl,
    price: 12.5,
    status: "active",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco depois do upload - */

test.each([
  ["name", "name_is_not_unique"],
  ["description", "description_is_not_unique"],
])("should return %s_is_not_unique when the %s already exists", async (field, expected) => {
  mockCreate.mockRejectedValue(buildPrismaError("P2002", { target: [field] }));

  const result = await createProduct(buildInput());

  expect(result).toBe(expected);
});

test.each([
  ["a unique error from another field", buildPrismaError("P2002", { target: ["image"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  const result = await createProduct(buildInput());

  expect(result).toBe(false);
});

test.each([
  ["a unique name error", buildPrismaError("P2002", { target: ["name"] })],
  ["a unique description error", buildPrismaError("P2002", { target: ["description"] })],
  ["an unknown error", new Error("db error")],
])("should delete the uploaded image when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  await createProduct(buildInput());

  expect(mockDel).toHaveBeenCalledWith(blobUrl);
});

test("should still return the error result when deleting the orphan image also fails", async () => {
  mockCreate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await createProduct(buildInput());

  expect(result).toBe("name_is_not_unique");
});
