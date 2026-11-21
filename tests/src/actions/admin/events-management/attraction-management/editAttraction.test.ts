import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { editAttraction } from "@/actions/admin/events-management/attraction-management/editAttraction";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockFindUnique = prisma.attraction.findUnique as unknown as Mock;
const mockUpdate = prisma.attraction.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type EditAttractionInput = Parameters<typeof editAttraction>[0];

const attractionId = "550e8400-e29b-41d4-a716-446655440000";
const oldImageUrl = "https://blob.vercel-storage.com/1600000000000-old.png";
const newImageUrl = "https://blob.vercel-storage.com/1700000000000-attraction.png";

const buildImage = () => new File(["image"], "attraction.png", { type: "image/png" });

// Sem o campo image a imagem não é trocada

const buildInput = (overrides: Partial<EditAttractionInput> = {}): EditAttractionInput => ({
  attractionId,
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
  ...overrides,
});

const buildDatabaseAttraction = (image: string) => ({
  id: attractionId,
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
  image,
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

const buildExpectedAttraction = (image: string) => ({
  id: attractionId,
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
  image,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
});

const baseData = {
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
};

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue({ image: oldImageUrl });
  mockPut.mockResolvedValue({ url: newImageUrl });
  mockDel.mockResolvedValue(undefined);
  mockUpdate.mockImplementation(async ({ data }) => buildDatabaseAttraction(data.image ?? oldImageUrl));
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await editAttraction(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["an id that is not a uuid", { attractionId: "not-a-uuid" }],
  ["a missing id", { attractionId: undefined }],
  ["an empty name", { name: "" }],
  ["a name over 50 characters", { name: "a".repeat(51) }],
  ["a name with an emoji", { name: "Banda 🎸" }],
  ["an empty description", { description: "" }],
  ["a description over 100 characters", { description: "a".repeat(101) }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "attraction.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "attraction.png", { type: "image/png" }) }],
  ["no field to update", { name: undefined, description: undefined }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await editAttraction(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a consulta da atração original - */

test("should look for the old image of the attraction even when there is no new image", async () => {
  await editAttraction(buildInput());

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: attractionId }, select: { image: true } });
});

test("should return false and skip the upload, the update and the cleanup when the attraction does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await editAttraction(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a edição sem troca de imagem - */

test("should update only the attraction data and skip the blob when there is no new image", async () => {
  await editAttraction(buildInput());

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: attractionId }, data: baseData });
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["the name", { description: undefined }, { name: "Banda Prisma" }],
  ["the description", { name: undefined }, { description: "Rock nacional ao vivo" }],
])("should update only %s when it is the only field sent", async (_description, overrides, expectedData) => {
  await editAttraction(buildInput(overrides));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: attractionId }, data: expectedData });
});

test("should update the attraction when the image is the only field sent", async () => {
  await editAttraction(buildInput({ name: undefined, description: undefined, image: buildImage() }));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: attractionId }, data: { image: newImageUrl } });
});

/* - Testando a edição com troca de imagem - */

test("should upload the new image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await editAttraction(buildInput({ image: buildImage() }));

  expect(mockPut).toHaveBeenCalledWith("1700000000000-attraction.png", expect.any(File), { access: "public" });
});

test("should update the attraction with the new image url", async () => {
  await editAttraction(buildInput({ image: buildImage() }));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: attractionId }, data: { ...baseData, image: newImageUrl } });
});

test("should remove the old image from the blob only after the attraction is updated", async () => {
  await editAttraction(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldImageUrl);
  expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should still return the edited attraction when removing the old image fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await editAttraction(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedAttraction(newImageUrl));
});

/* - Testando o resultado - */

test.each([
  ["with a new image", { image: buildImage() }, newImageUrl],
  ["without a new image", {}, oldImageUrl],
])("should return the edited attraction with the dates as strings %s", async (_description, overrides, expectedImage) => {
  const result = await editAttraction(buildInput(overrides));

  expect(result).toEqual(buildExpectedAttraction(expectedImage));
});

/* - Testando as falhas antes da edição - */

test.each([
  ["looking for the old image", () => mockFindUnique],
  ["uploading the new image", () => mockPut],
])("should return false and skip the update and the cleanup when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await editAttraction(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco na edição - */

test("should return name_is_not_unique when the name already exists", async () => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));

  const result = await editAttraction(buildInput());

  expect(result).toBe("name_is_not_unique");
});

test.each([
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  const result = await editAttraction(buildInput());

  expect(result).toBe(false);
});

/* - Testando a limpeza da imagem nova quando a edição falha - */

test.each([
  ["a unique name error", buildPrismaError("P2002", { target: ["name"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should delete only the new image and keep the old one when the update fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  await editAttraction(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(newImageUrl);
});

test("should not delete anything when the update fails and there is no new image", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  await editAttraction(buildInput());

  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return the error result when deleting the new image also fails", async () => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await editAttraction(buildInput({ image: buildImage() }));

  expect(result).toBe("name_is_not_unique");
});
