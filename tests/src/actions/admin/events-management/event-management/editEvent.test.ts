import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { editEvent } from "@/actions/admin/events-management/event-management/editEvent";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del, put } from "@vercel/blob";
import { getUserIdsThatFavoritedEvent, notifyFavoriteEventByEmail, notifyPromotionsByEmail } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return {
    prisma,
    getEventStatus,
    getUserIdsThatFavoritedEvent: vi.fn(),
    notifyFavoriteEventByEmail: vi.fn(),
    notifyPromotionsByEmail: vi.fn(),
  };
});

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockPut = put as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockGetUserIdsThatFavoritedEvent = getUserIdsThatFavoritedEvent as unknown as Mock;
const mockNotifyFavoriteEventByEmail = notifyFavoriteEventByEmail as unknown as Mock;
const mockNotifyPromotionsByEmail = notifyPromotionsByEmail as unknown as Mock;
const mockFindUnique = prisma.event.findUnique as unknown as Mock;
const mockUpdate = prisma.event.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type EditEventInput = Parameters<typeof editEvent>[0];

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const attractionId = "660e8400-e29b-41d4-a716-446655440000";
const oldImageUrl = "https://blob.vercel-storage.com/1600000000000-old.png";
const newImageUrl = "https://blob.vercel-storage.com/1700000000000-event.png";
const originalStartsAt = new Date("2099-01-01T20:00:00.000Z");
const changedStartsAt = new Date("2099-02-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");
const favoriteUserIds = ["user 1", "user 2"];

const buildImage = () => new File(["image"], "event.png", { type: "image/png" });

// Sem o campo image a imagem não é trocada

const buildInput = (overrides: Partial<EditEventInput> = {}): EditEventInput => ({
  eventId,
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  ...overrides,
});

// O price e o rating do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildOriginalEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  image: oldImageUrl,
  price: { toNumber: () => 50 },
  startsAt: originalStartsAt,
  ...overrides,
});

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  attractionId,
  image: oldImageUrl,
  isCancelled: false,
  price: { toNumber: () => 50 },
  startsAt: originalStartsAt,
  attendees: 3,
  rating: { toNumber: () => 4.5 },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  attraction: { id: attractionId, name: "Banda Prisma" },
  ...overrides,
});

const buildExpectedEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  attractionId,
  attractionName: "Banda Prisma",
  image: oldImageUrl,
  status: "soon",
  price: 50,
  startsAt: "2099-01-01T20:00:00.000Z",
  attendees: 3,
  rating: 4.5,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
  ...overrides,
});

const attractionInclude = { attraction: { select: { id: true, name: true } } };

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue(buildOriginalEvent());
  mockPut.mockResolvedValue({ url: newImageUrl });
  mockDel.mockResolvedValue(undefined);
  mockUpdate.mockImplementation(async ({ data }) => buildDatabaseEvent({ image: data.image ?? oldImageUrl }));
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(favoriteUserIds);
  mockNotifyFavoriteEventByEmail.mockResolvedValue(true);
  mockNotifyPromotionsByEmail.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando permissão e validação - */

test("should return false and skip the upload and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await editEvent(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["an id that is not a uuid", { eventId: "not-a-uuid" }],
  ["a missing id", { eventId: undefined }],
  ["an empty title", { title: "" }],
  ["a title over 30 characters", { title: "a".repeat(31) }],
  ["a title with an emoji", { title: "Rock 🎸" }],
  ["an unknown tag", { tag: "invalid" }],
  ["an empty description", { description: "" }],
  ["a description over 100 characters", { description: "a".repeat(101) }],
  ["an attraction id that is not a uuid", { attractionId: "not-a-uuid" }],
  ["a price of zero", { price: 0 }],
  ["a negative price", { price: -1 }],
  ["a date that is not valid", { startsAt: "not a date" }],
  ["an image that is not a file", { image: "not a file" }],
  ["an image with an unsupported type", { image: new File(["image"], "event.gif", { type: "image/gif" }) }],
  ["an image over 4.5MB", { image: new File([new ArrayBuffer(4.5 * 1024 * 1024)], "event.png", { type: "image/png" }) }],
  ["no field to update", { title: undefined, description: undefined }],
])("should return false and skip the upload and the database when the input has %s", async (_description, invalidInput) => {
  const result = await editEvent(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a consulta do evento original - */

test("should look for the original event by id", async () => {
  await editEvent(buildInput());

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: eventId } });
});

test("should return false and skip the upload, the update and the cleanup when the event does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await editEvent(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando a data do evento - */

test("should return false and skip the upload and the update when the new date is in the past", async () => {
  const result = await editEvent(buildInput({ startsAt: pastStartsAt, image: buildImage() }));

  expect(result).toBe(false);
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should allow editing an event that already happened when its date does not change", async () => {
  mockFindUnique.mockResolvedValue(buildOriginalEvent({ startsAt: pastStartsAt }));

  await editEvent(buildInput({ startsAt: pastStartsAt }));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
});

/* - Testando a edição sem troca de imagem - */

test("should update only the event data and skip the blob when there is no new image", async () => {
  await editEvent(buildInput());

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: eventId },
    data: { title: "Rock na Praça", description: "Noite de rock nacional ao vivo" },
    include: attractionInclude,
  });
  expect(mockPut).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test("should send every field that was edited", async () => {
  await editEvent(buildInput({ tag: "pop", attractionId, price: 80, startsAt: changedStartsAt }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: eventId },
    data: {
      title: "Rock na Praça",
      description: "Noite de rock nacional ao vivo",
      tag: "pop",
      attractionId,
      price: 80,
      startsAt: changedStartsAt,
    },
    include: attractionInclude,
  });
});

/* - Testando a edição com troca de imagem - */

test("should upload the new image as public using the timestamp and the file name", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1700000000000);

  await editEvent(buildInput({ image: buildImage() }));

  expect(mockPut).toHaveBeenCalledWith("1700000000000-event.png", expect.any(File), { access: "public" });
});

test("should update the event with the new image url", async () => {
  await editEvent(buildInput({ image: buildImage() }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: eventId },
    data: { title: "Rock na Praça", description: "Noite de rock nacional ao vivo", image: newImageUrl },
    include: attractionInclude,
  });
});

test("should remove the old image from the blob only after the event is updated", async () => {
  await editEvent(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldImageUrl);
  expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should still return the edited event when removing the old image fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await editEvent(buildInput({ image: buildImage() }));

  expect(result).toEqual(buildExpectedEvent({ image: newImageUrl }));
});

/* - Testando o resultado - */

test.each([
  ["with a new image", { image: buildImage() }, newImageUrl],
  ["without a new image", {}, oldImageUrl],
])("should return the edited event with the attraction, the numbers and the dates as strings %s", async (_description, overrides, expectedImage) => {
  const result = await editEvent(buildInput(overrides));

  expect(result).toEqual(buildExpectedEvent({ image: expectedImage }));
});

test.each([
  ["soon", {}],
  ["cancelled", { isCancelled: true }],
  ["happened", { startsAt: pastStartsAt }],
])("should return the %s status calculated from the edited event", async (expectedStatus, overrides) => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent(overrides));

  const result = await editEvent(buildInput());

  expect(result).toMatchObject({ status: expectedStatus });
});

/* - Testando as falhas antes da edição - */

test.each([
  ["looking for the original event", () => mockFindUnique],
  ["uploading the new image", () => mockPut],
])("should return false and skip the update and the cleanup when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await editEvent(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco na edição - */

test("should return false when the database fails", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  const result = await editEvent(buildInput());

  expect(result).toBe(false);
  expect(mockNotifyFavoriteEventByEmail).not.toHaveBeenCalled();
});

test("should delete only the new image and keep the old one when the update fails", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  await editEvent(buildInput({ image: buildImage() }));

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(newImageUrl);
});

test("should not delete anything when the update fails and there is no new image", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  await editEvent(buildInput());

  expect(mockDel).not.toHaveBeenCalled();
});

test("should still return false when deleting the new image also fails", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));
  mockDel.mockRejectedValue(new Error("blob delete error"));

  const result = await editEvent(buildInput({ image: buildImage() }));

  expect(result).toBe(false);
});

/* - Testando a notificação dos favoritos - */

test("should notify the favorites when the date changes", async () => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent({ startsAt: changedStartsAt }));

  await editEvent(buildInput({ startsAt: changedStartsAt }));

  expect(mockNotifyFavoriteEventByEmail).toHaveBeenCalledTimes(1);
  expect(mockNotifyFavoriteEventByEmail).toHaveBeenCalledWith(eventId, {
    type: "event_update",
    title: "Evento favorito atualizado",
    message: "Rock na Praça: a data foi alterada.",
  });
  expect(mockNotifyPromotionsByEmail).not.toHaveBeenCalled();
});

test("should notify the favorites and send the promotion when the price drops", async () => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent({ price: { toNumber: () => 40 } }));

  await editEvent(buildInput({ price: 40 }));

  expect(mockNotifyFavoriteEventByEmail).toHaveBeenCalledWith(eventId, {
    type: "event_update",
    title: "Evento favorito atualizado",
    message: "Rock na Praça: o preço baixou para R$ 40,00.",
  });
  expect(mockGetUserIdsThatFavoritedEvent).toHaveBeenCalledWith(eventId);
  expect(mockNotifyPromotionsByEmail).toHaveBeenCalledWith(
    {
      type: "event_update",
      title: "Preço baixou",
      message: "Rock na Praça: o preço baixou para R$ 40,00.",
    },
    favoriteUserIds,
  );
});

test("should describe both changes in the same notification when the date changes and the price drops", async () => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent({ startsAt: changedStartsAt, price: { toNumber: () => 40.5 } }));

  await editEvent(buildInput({ startsAt: changedStartsAt, price: 40.5 }));

  expect(mockNotifyFavoriteEventByEmail).toHaveBeenCalledTimes(1);
  expect(mockNotifyFavoriteEventByEmail).toHaveBeenCalledWith(
    eventId,
    expect.objectContaining({ message: "Rock na Praça: a data foi alterada e o preço baixou para R$ 40,50." }),
  );
});

test.each([
  ["only the title changes", {}, {}],
  ["the price goes up", { price: 80 }, { price: { toNumber: () => 80 } }],
  ["the price stays the same", { price: 50 }, {}],
])("should not notify anyone when %s", async (_description, inputOverrides, databaseOverrides) => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent(databaseOverrides));

  await editEvent(buildInput(inputOverrides));

  expect(mockNotifyFavoriteEventByEmail).not.toHaveBeenCalled();
  expect(mockNotifyPromotionsByEmail).not.toHaveBeenCalled();
});

test("should not notify anyone when the edited event is cancelled", async () => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent({ isCancelled: true, startsAt: changedStartsAt, price: { toNumber: () => 40 } }));

  const result = await editEvent(buildInput({ startsAt: changedStartsAt, price: 40 }));

  expect(result).toMatchObject({ status: "cancelled" });
  expect(mockNotifyFavoriteEventByEmail).not.toHaveBeenCalled();
  expect(mockNotifyPromotionsByEmail).not.toHaveBeenCalled();
});

test("should still return the edited event and keep the new image when the notification fails", async () => {
  mockUpdate.mockResolvedValue(buildDatabaseEvent({ image: newImageUrl, startsAt: changedStartsAt }));
  mockNotifyFavoriteEventByEmail.mockRejectedValue(new Error("notification error"));

  const result = await editEvent(buildInput({ startsAt: changedStartsAt, image: buildImage() }));

  expect(result).toMatchObject({ id: eventId, image: newImageUrl });
  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith(oldImageUrl);
});
