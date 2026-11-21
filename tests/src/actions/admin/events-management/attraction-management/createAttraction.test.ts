import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { createAttraction } from "@/actions/admin/events-management/attraction-management/createAttraction";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockCreate = prisma.attraction.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type CreateAttractionInput = Parameters<typeof createAttraction>[0];

const blobUrl = "https://blob.vercel-storage.com/1700000000000-attraction.png";

const buildImage = () => new File(["image"], "attraction.png", { type: "image/png" });

const buildInput = (overrides: Partial<CreateAttractionInput> = {}): CreateAttractionInput => ({
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
  image: buildImage(),
  ...overrides,
});

const buildDatabaseAttraction = (overrides: Record<string, unknown> = {}) => ({
  id: "attraction 1",
  name: "Banda Prisma",
  description: "Rock nacional ao vivo",
  image: blobUrl,
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockPut.mockResolvedValue({ url: blobUrl });
  mockDel.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue(buildDatabaseAttraction());
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await createAttraction(buildInput());

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

test.each([
  ["a missing name", { name: undefined }],
  ["an empty name", { name: "" }],
  ["a name over 50 characters", { name: "a".repeat(51) }],
  ["a name with an emoji", { name: "Banda 🎸" }],
  ["an empty description", { description: "" }],
  ["a description over 100 characters", { description: "a".repeat(101) }],
  ["a description with an emoji", { description: "Rock 🎸" }],
  ["a missing image", { image: undefined }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "attraction.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "attraction.png", { type: "image/png" }) }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await createAttraction(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando o upload e a consulta ao banco - */

test("should upload the image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await createAttraction(buildInput());

  expect(mockPut).toHaveBeenCalledWith("1700000000000-attraction.png", expect.any(File), { access: "public" });
});

test("should create the attraction with the data from the input and the uploaded image url", async () => {
  await createAttraction(buildInput());

  expect(mockCreate).toHaveBeenCalledWith({
    data: {
      name: "Banda Prisma",
      description: "Rock nacional ao vivo",
      image: blobUrl,
    },
  });
});

test("should create the attraction without a description when none is given", async () => {
  await createAttraction(buildInput({ description: undefined }));

  expect(mockCreate).toHaveBeenCalledWith({
    data: {
      name: "Banda Prisma",
      image: blobUrl,
    },
  });
});

test("should return false and skip the database and the cleanup when the upload fails", async () => {
  mockPut.mockRejectedValue(new Error("blob error"));

  const result = await createAttraction(buildInput());

  expect(result).toBe(false);
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should return the created attraction with the dates as strings", async () => {
  const result = await createAttraction(buildInput());

  expect(result).toEqual({
    id: "attraction 1",
    name: "Banda Prisma",
    description: "Rock nacional ao vivo",
    image: blobUrl,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
  expect(mockDel).not.toHaveBeenCalled();
});

test("should return the attraction with a null description when it was created without one", async () => {
  mockCreate.mockResolvedValue(buildDatabaseAttraction({ description: null }));

  const result = await createAttraction(buildInput({ description: undefined }));

  expect(result).toMatchObject({ id: "attraction 1", description: null });
});

/* - Testando as falhas do banco depois do upload - */

test("should return name_is_not_unique when the name already exists", async () => {
  mockCreate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));

  const result = await createAttraction(buildInput());

  expect(result).toBe("name_is_not_unique");
});

test.each([
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  const result = await createAttraction(buildInput());

  expect(result).toBe(false);
});

test.each([
  ["a unique name error", buildPrismaError("P2002", { target: ["name"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["name"] })],
  ["an unknown error", new Error("db error")],
])("should delete the uploaded image when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  await createAttraction(buildInput());

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(blobUrl);
});

test("should still return the error result when deleting the orphan image also fails", async () => {
  mockCreate.mockRejectedValue(buildPrismaError("P2002", { target: ["name"] }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await createAttraction(buildInput());

  expect(result).toBe("name_is_not_unique");
});
