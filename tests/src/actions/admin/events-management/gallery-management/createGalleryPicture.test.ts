import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { createGalleryPicture } from "@/actions/admin/events-management/gallery-management/createGalleryPicture";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockValidateSession = validateSession as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockCreate = prisma.gallery.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type CreateGalleryPictureInput = Parameters<typeof createGalleryPicture>[0];

const adminUserId = "admin 1";
const eventId = "550e8400-e29b-41d4-a716-446655440000";
const blobUrl = "https://blob.vercel-storage.com/1700000000000-picture.png";
const happenedAt = new Date("2026-01-10T20:00:00.000Z");

const buildImage = () => new File(["image"], "picture.png", { type: "image/png" });

const buildInput = (overrides: Partial<CreateGalleryPictureInput> = {}): CreateGalleryPictureInput => ({
  eventId,
  title: "Show de abertura",
  image: buildImage(),
  happenedAt,
  ...overrides,
});

const buildDatabasePicture = () => ({
  id: "picture 1",
  userId: adminUserId,
  eventId,
  image: blobUrl,
  title: "Show de abertura",
  happenedAt,
  createdAt: new Date("2026-01-11T12:00:00.000Z"),
  updatedAt: new Date("2026-01-12T12:00:00.000Z"),
});

const buildPrismaError = (code: string, meta: Record<string, unknown> = {}) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockValidateSession.mockResolvedValue({ session: { id: "session 1" }, user: { id: adminUserId, role: "admin" } });
  mockPut.mockResolvedValue({ url: blobUrl });
  mockDel.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue(buildDatabasePicture());
});

/* - Testando permissão e validação - */

test("should return false and skip the session, the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

test.each([
  ["a missing event id", { eventId: undefined }],
  ["an event id that is not a uuid", { eventId: "not-a-uuid" }],
  ["a missing title", { title: undefined }],
  ["an empty title", { title: "" }],
  ["a title over 30 characters", { title: "a".repeat(31) }],
  ["a title with an emoji", { title: "Show 🎸" }],
  ["a missing image", { image: undefined }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "picture.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "picture.png", { type: "image/png" }) }],
  ["a missing date", { happenedAt: undefined }],
  ["a date that is not valid", { happenedAt: "not a date" }],
])("should return false and skip the session, the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await createGalleryPicture(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando a sessão - */

test("should return false and skip the upload and the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando o upload e a consulta ao banco - */

test("should upload the image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await createGalleryPicture(buildInput());

  expect(mockPut).toHaveBeenCalledWith("1700000000000-picture.png", expect.any(File), { access: "public" });
});

test("should create the picture in the name of the admin using the data from the input and the uploaded image url", async () => {
  await createGalleryPicture(buildInput());

  expect(mockCreate).toHaveBeenCalledWith({
    data: {
      userId: adminUserId,
      eventId,
      image: blobUrl,
      title: "Show de abertura",
      happenedAt,
    },
  });
});

test("should accept the date as an ISO string", async () => {
  await createGalleryPicture(buildInput({ happenedAt: "2026-01-10T20:00:00.000Z" as never }));

  expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ happenedAt }) });
});

test("should return false and skip the database and the cleanup when the upload fails", async () => {
  mockPut.mockRejectedValue(new Error("blob error"));

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe(false);
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should return the created picture with the dates as strings", async () => {
  const result = await createGalleryPicture(buildInput());

  expect(result).toEqual({
    id: "picture 1",
    userId: adminUserId,
    eventId,
    image: blobUrl,
    title: "Show de abertura",
    happenedAt: "2026-01-10T20:00:00.000Z",
    createdAt: "2026-01-11T12:00:00.000Z",
    updatedAt: "2026-01-12T12:00:00.000Z",
  });
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco depois do upload - */

test("should return event_not_found when the event does not exist", async () => {
  mockCreate.mockRejectedValue(buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" }));

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe("event_not_found");
});

test.each([
  ["a prisma error that is not a foreign key", buildPrismaError("P2002", { target: ["title"] })],
  ["an unknown error", new Error("db error")],
])("should return false when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe(false);
});

test.each([
  ["an event that does not exist", buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" })],
  ["a prisma error that is not a foreign key", buildPrismaError("P2002", { target: ["title"] })],
  ["an unknown error", new Error("db error")],
])("should delete the uploaded image when the database fails with %s", async (_description, error) => {
  mockCreate.mockRejectedValue(error);

  await createGalleryPicture(buildInput());

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(blobUrl);
});

test("should still return the error result when deleting the orphan image also fails", async () => {
  mockCreate.mockRejectedValue(buildPrismaError("P2003", { constraint: "galleries_event_id_fkey" }));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await createGalleryPicture(buildInput());

  expect(result).toBe("event_not_found");
});
