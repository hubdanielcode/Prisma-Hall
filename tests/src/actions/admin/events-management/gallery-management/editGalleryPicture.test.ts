import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { editGalleryPicture } from "@/actions/admin/events-management/gallery-management/editGalleryPicture";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockFindUnique = prisma.gallery.findUnique as unknown as Mock;
const mockUpdate = prisma.gallery.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type EditGalleryPictureInput = Parameters<typeof editGalleryPicture>[0];

const pictureId = "550e8400-e29b-41d4-a716-446655440000";
const eventId = "660e8400-e29b-41d4-a716-446655440000";
const oldImageUrl = "https://blob.vercel-storage.com/1600000000000-old.png";
const newImageUrl = "https://blob.vercel-storage.com/1700000000000-picture.png";
const happenedAt = new Date("2026-01-10T20:00:00.000Z");

const buildImage = () => new File(["image"], "picture.png", { type: "image/png" });

// Sem o campo image a imagem não é trocada

const buildInput = (overrides: Partial<EditGalleryPictureInput> = {}): EditGalleryPictureInput => ({
  pictureId,
  eventId,
  title: "Show de abertura",
  happenedAt,
  ...overrides,
});

const buildDatabasePicture = (image: string) => ({
  id: pictureId,
  userId: "admin 1",
  eventId,
  image,
  title: "Show de abertura",
  happenedAt,
  createdAt: new Date("2026-01-11T12:00:00.000Z"),
  updatedAt: new Date("2026-01-12T12:00:00.000Z"),
});

const buildExpectedPicture = (image: string) => ({
  id: pictureId,
  userId: "admin 1",
  eventId,
  image,
  title: "Show de abertura",
  happenedAt: "2026-01-10T20:00:00.000Z",
  createdAt: "2026-01-11T12:00:00.000Z",
  updatedAt: "2026-01-12T12:00:00.000Z",
});

const baseData = {
  eventId,
  title: "Show de abertura",
  happenedAt,
};

const buildPrismaError = (code: string, meta: Record<string, unknown> = {}) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue({ image: oldImageUrl });
  mockPut.mockResolvedValue({ url: newImageUrl });
  mockDel.mockResolvedValue(undefined);
  mockUpdate.mockImplementation(async ({ data }) => buildDatabasePicture(data.image ?? oldImageUrl));
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["an id that is not a uuid", { pictureId: "not-a-uuid" }],
  ["a missing id", { pictureId: undefined }],
  ["an event id that is not a uuid", { eventId: "not-a-uuid" }],
  ["an empty title", { title: "" }],
  ["a title over 30 characters", { title: "a".repeat(31) }],
  ["a title with an emoji", { title: "Show 🎸" }],
  ["a date that is not valid", { happenedAt: "not a date" }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "picture.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "picture.png", { type: "image/png" }) }],
  ["no field to update", { eventId: undefined, title: undefined, happenedAt: undefined }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await editGalleryPicture(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a edição sem troca de imagem - */

test("should update only the picture data and skip the old image lookup and the blob when there is no new image", async () => {
  await editGalleryPicture(buildInput());

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: pictureId }, data: baseData });
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["the event", { title: undefined, happenedAt: undefined }, { eventId }],
  ["the title", { eventId: undefined, happenedAt: undefined }, { title: "Show de abertura" }],
  ["the date", { eventId: undefined, title: undefined }, { happenedAt }],
])("should update only %s when it is the only field sent", async (_description, overrides, expectedData) => {
  await editGalleryPicture(buildInput(overrides));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: pictureId }, data: expectedData });
});

test("should accept the date as an ISO string", async () => {
  await editGalleryPicture(buildInput({ happenedAt: "2026-01-10T20:00:00.000Z" as never }));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: pictureId }, data: expect.objectContaining({ happenedAt }) });
});

/* - Testando a edição com troca de imagem - */

test("should look for the old image before uploading the new one", async () => {
  await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: pictureId }, select: { image: true } });
  expect(mockFindUnique.mock.invocationCallOrder[0]).toBeLessThan(mockPut.mock.invocationCallOrder[0]);
});

test("should upload the new image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(mockPut).toHaveBeenCalledWith("1700000000000-picture.png", expect.any(File), { access: "public" });
});

test("should update the picture with the new image url", async () => {
  await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: pictureId }, data: { ...baseData, image: newImageUrl } });
});

test("should remove the old image from the blob only after the picture is updated", async () => {
  await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldImageUrl);
  expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should not try to remove an old image when the picture had none registered", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedPicture(newImageUrl));
  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return the edited picture when removing the old image fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedPicture(newImageUrl));
});

/* - Testando o resultado - */

test.each([
  ["with a new image", { image: buildImage() }, newImageUrl],
  ["without a new image", {}, oldImageUrl],
])("should return the edited picture with the dates as strings %s", async (_description, overrides, expectedImage) => {
  const result = await editGalleryPicture(buildInput(overrides));

  expect(result).toEqual(buildExpectedPicture(expectedImage));
});

/* - Testando as falhas antes da edição - */

test.each([
  ["looking for the old image", () => mockFindUnique],
  ["uploading the new image", () => mockPut],
])("should return false and skip the update and the cleanup when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco na edição - */

test("should return event_not_found when the event does not exist", async () => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" }));

  const result = await editGalleryPicture(buildInput());

  expect(result).toBe("event_not_found");
});

test.each([
  ["a prisma error that is not a foreign key", buildPrismaError("P2025")],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  const result = await editGalleryPicture(buildInput());

  expect(result).toBe(false);
});

/* - Testando a limpeza da imagem nova quando a edição falha - */

test.each([
  ["an event that does not exist", buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" })],
  ["a prisma error that is not a foreign key", buildPrismaError("P2025")],
  ["an unknown error", new Error("db error")],
])("should delete only the new image and keep the old one when the update fails with %s", async (_description, error) => {
  mockUpdate.mockRejectedValue(error);

  await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(newImageUrl);
});

test("should not delete anything when the update fails and there is no new image", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  await editGalleryPicture(buildInput());

  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return the error result when deleting the new image also fails", async () => {
  mockUpdate.mockRejectedValue(buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await editGalleryPicture(buildInput({ image: buildImage() }));

  expect(result).toBe("event_not_found");
});
