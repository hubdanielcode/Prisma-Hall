import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { createEvent } from "@/actions/admin/events-management/event-management/createEvent";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { notifyPromotionsByEmail } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus, notifyPromotionsByEmail: vi.fn() };
});

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockNotifyPromotionsByEmail = notifyPromotionsByEmail as unknown as Mock;
const mockCreate = prisma.event.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type CreateEventInput = Parameters<typeof createEvent>[0];

const attractionId = "550e8400-e29b-41d4-a716-446655440000";
const blobUrl = "https://blob.vercel-storage.com/1700000000000-event.png";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildImage = () => new File(["image"], "event.png", { type: "image/png" });

const buildInput = (overrides: Partial<CreateEventInput> = {}): CreateEventInput => ({
  title: "Rock na Praça",
  tag: "rock",
  description: "Noite de rock nacional ao vivo",
  attractionId,
  image: buildImage(),
  price: 50,
  startsAt: futureStartsAt,
  ...overrides,
});

// O price e o rating do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "event 1",
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  attractionId,
  image: blobUrl,
  isCancelled: false,
  price: { toNumber: () => 50 },
  startsAt: futureStartsAt,
  attendees: 0,
  rating: { toNumber: () => 0 },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  attraction: { id: attractionId, name: "Banda Prisma" },
  ...overrides,
});

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockPut.mockResolvedValue({ url: blobUrl });
  mockDel.mockResolvedValue(undefined);
  mockCreate.mockResolvedValue(buildDatabaseEvent());
  mockNotifyPromotionsByEmail.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await createEvent(buildInput());

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

test.each([
  ["a missing title", { title: undefined }],
  ["an empty title", { title: "" }],
  ["a title over 30 characters", { title: "a".repeat(31) }],
  ["a title with an emoji", { title: "Rock 🎸" }],
  ["an unknown tag", { tag: "invalid" }],
  ["an empty description", { description: "" }],
  ["a description over 100 characters", { description: "a".repeat(101) }],
  ["an attraction id that is not a uuid", { attractionId: "not-a-uuid" }],
  ["a price of zero", { price: 0 }],
  ["a negative price", { price: -1 }],
  ["a price that is not a number", { price: "50" }],
  ["a date that is not valid", { startsAt: "not a date" }],
  ["a missing image", { image: undefined }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "event.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "event.png", { type: "image/png" }) }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await createEvent(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando a data do evento - */

test("should return false and skip the upload when the event starts in the past", async () => {
  const result = await createEvent(buildInput({ startsAt: pastStartsAt }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

test("should return false and skip the upload when the event starts exactly now", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  const result = await createEvent(buildInput({ startsAt: new Date(1700000000000) }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

test("should accept the date as an ISO string", async () => {
  await createEvent(buildInput({ startsAt: "2099-01-01T20:00:00.000Z" as never }));

  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ startsAt: futureStartsAt }) }));
});

/* - Testando o upload e a consulta ao banco - */

test("should upload the image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await createEvent(buildInput());

  expect(mockPut).toHaveBeenCalledWith("1700000000000-event.png", expect.any(File), { access: "public" });
});

test("should create the event with the data from the input and the uploaded image url", async () => {
  await createEvent(buildInput());

  expect(mockCreate).toHaveBeenCalledWith({
    data: {
      title: "Rock na Praça",
      description: "Noite de rock nacional ao vivo",
      tag: "rock",
      attractionId,
      image: blobUrl,
      price: 50,
      startsAt: futureStartsAt,
    },
    include: { attraction: { select: { id: true, name: true } } },
  });
});

test("should return false and skip the database and the cleanup when the upload fails", async () => {
  mockPut.mockRejectedValue(new Error("blob error"));

  const result = await createEvent(buildInput());

  expect(result).toBe(false);
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should return the created event with the attraction, the numbers and the dates as strings", async () => {
  const result = await createEvent(buildInput());

  expect(result).toEqual({
    id: "event 1",
    title: "Rock na Praça",
    description: "Noite de rock nacional ao vivo",
    tag: "rock",
    attractionId,
    attractionName: "Banda Prisma",
    image: blobUrl,
    price: 50,
    startsAt: "2099-01-01T20:00:00.000Z",
    attendees: 0,
    rating: 0,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a notificação da novidade - */

test("should notify the users about the new event when it is coming soon", async () => {
  await createEvent(buildInput());

  expect(mockNotifyPromotionsByEmail).toHaveBeenCalledTimes(1);
  expect(mockNotifyPromotionsByEmail).toHaveBeenCalledWith({
    type: "new_event",
    title: "Novo evento na agenda",
    message: "Rock na Praça com Banda Prisma já está na agenda.",
  });
});

test.each([
  ["it is cancelled", { isCancelled: true }],
  ["it already happened", { startsAt: pastStartsAt }],
])("should return the event without notifying anyone when %s", async (_description, overrides) => {
  mockCreate.mockResolvedValue(buildDatabaseEvent(overrides));

  const result = await createEvent(buildInput());

  expect(result).toMatchObject({ id: "event 1" });
  expect(mockNotifyPromotionsByEmail).not.toHaveBeenCalled();
});

test("should still return the created event and keep the image when the notification fails", async () => {
  mockNotifyPromotionsByEmail.mockRejectedValue(new Error("notification error"));

  const result = await createEvent(buildInput());

  expect(result).toMatchObject({ id: "event 1", image: blobUrl });
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco depois do upload - */

test("should return false and delete the uploaded image when the database fails", async () => {
  mockCreate.mockRejectedValue(new Error("db error"));

  const result = await createEvent(buildInput());

  expect(result).toBe(false);
  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(blobUrl);
  expect(mockNotifyPromotionsByEmail).not.toHaveBeenCalled();
});

test("should still return false when deleting the orphan image also fails", async () => {
  mockCreate.mockRejectedValue(new Error("db error"));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await createEvent(buildInput());

  expect(result).toBe(false);
});
