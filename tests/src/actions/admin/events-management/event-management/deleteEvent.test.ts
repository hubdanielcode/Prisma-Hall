import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { deleteEvent } from "@/actions/admin/events-management/event-management/deleteEvent";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del } from "@vercel/blob";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus, getUserIdsThatFavoritedEvent: vi.fn(), notifyUsersByEmail: vi.fn() };
});

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockGetUserIdsThatFavoritedEvent = getUserIdsThatFavoritedEvent as unknown as Mock;
const mockNotifyUsersByEmail = notifyUsersByEmail as unknown as Mock;
const mockFindUnique = prisma.event.findUnique as unknown as Mock;
const mockEventDelete = prisma.event.delete as unknown as Mock;
const mockCartDeleteMany = prisma.cart.deleteMany as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

/* - Funções e dados auxiliares - */

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const imageUrl = "https://blob.vercel-storage.com/1700000000000-event.png";
const favoriteUserIds = ["user 1", "user 2"];

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  image: imageUrl,
  isCancelled: false,
  startsAt: new Date("2099-01-01T20:00:00.000Z"),
  _count: { tickets: 0, reviews: 0, galleries: 0 },
  ...overrides,
});

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue(buildDatabaseEvent());
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(favoriteUserIds);
  mockNotifyUsersByEmail.mockResolvedValue(true);
  mockCartDeleteMany.mockReturnValue("cart delete query");
  mockEventDelete.mockReturnValue("event delete query");
  mockTransaction.mockResolvedValue([]);
  mockDel.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando permissão - */

test("should return unauthorized and skip the database, the blob and the notification when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: false, reason: "unauthorized" });
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should look for the event with the count of its dependencies", async () => {
  await deleteEvent(eventId);

  expect(mockFindUnique).toHaveBeenCalledWith({
    where: { id: eventId },
    include: { _count: { select: { tickets: true, reviews: true, galleries: true } } },
  });
});

test("should return not-found and skip the delete, the blob and the notification when the event does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: false, reason: "not-found" });
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

test.each([
  ["tickets", { tickets: 1, reviews: 0, galleries: 0 }],
  ["reviews", { tickets: 0, reviews: 1, galleries: 0 }],
  ["pictures in the gallery", { tickets: 0, reviews: 0, galleries: 1 }],
])("should return has-dependencies and skip the delete when the event has %s", async (_description, count) => {
  mockFindUnique.mockResolvedValue(buildDatabaseEvent({ _count: count }));

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: false, reason: "has-dependencies" });
  expect(mockGetUserIdsThatFavoritedEvent).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando a exclusão - */

test("should delete the cart items and then the event in the same transaction", async () => {
  await deleteEvent(eventId);

  expect(mockCartDeleteMany).toHaveBeenCalledWith({ where: { eventId } });
  expect(mockEventDelete).toHaveBeenCalledWith({ where: { id: eventId } });
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction).toHaveBeenCalledWith(["cart delete query", "event delete query"]);
});

test("should look for the favorites before the event is deleted", async () => {
  await deleteEvent(eventId);

  expect(mockGetUserIdsThatFavoritedEvent).toHaveBeenCalledWith(eventId);
  expect(mockGetUserIdsThatFavoritedEvent.mock.invocationCallOrder[0]).toBeLessThan(mockTransaction.mock.invocationCallOrder[0]);
});

test.each([
  ["it is cancelled", { isCancelled: true }],
  ["it already happened", { startsAt: new Date("2020-01-01T20:00:00.000Z") }],
])("should not look for the favorites when %s", async (_description, overrides) => {
  mockFindUnique.mockResolvedValue(buildDatabaseEvent(overrides));

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: true });
  expect(mockGetUserIdsThatFavoritedEvent).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith([], expect.any(Object));
});

/* - Testando o resultado - */

test("should return success and remove the image from the blob only after the event is deleted", async () => {
  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: true });
  expect(mockDel).toHaveBeenCalledWith(imageUrl);
  expect(mockTransaction.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should notify the users who favorited the event that it was cancelled", async () => {
  await deleteEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledTimes(1);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(favoriteUserIds, {
    type: "event_update",
    title: "Evento favorito cancelado",
    message: "Rock na Praça foi cancelado.",
  });
});

test("should still return success when removing the image from the blob fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: true });
  expect(mockNotifyUsersByEmail).toHaveBeenCalled();
});

test("should still return success when the notification fails", async () => {
  mockNotifyUsersByEmail.mockRejectedValue(new Error("notification error"));

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: true });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the event", () => mockFindUnique],
  ["looking for the favorites", () => mockGetUserIdsThatFavoritedEvent],
  ["deleting the event", () => mockTransaction],
])("should return unknown and skip the blob and the notification when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await deleteEvent(eventId);

  expect(result).toEqual({ success: false, reason: "unknown" });
  expect(mockDel).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});
