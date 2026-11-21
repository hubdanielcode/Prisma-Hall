import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { favoriteEvent } from "@/actions/events/event/favoriteEvent";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUniqueEvent = prisma.event.findUnique as unknown as Mock;
const mockFindUniqueFavorite = prisma.favoriteEvent.findUnique as unknown as Mock;
const mockCreateFavorite = prisma.favoriteEvent.create as unknown as Mock;
const mockDeleteFavorite = prisma.favoriteEvent.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  isCancelled: false,
  startsAt: futureStartsAt,
  ...overrides,
});

const favoriteKey = { userId_eventId: { userId: "user 1", eventId } };

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent());
  mockFindUniqueFavorite.mockResolvedValue(null);
  mockCreateFavorite.mockResolvedValue({});
  mockDeleteFavorite.mockResolvedValue({});
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await favoriteEvent(eventId);

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateFavorite).not.toHaveBeenCalled();
  expect(mockDeleteFavorite).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await favoriteEvent(invalidId);

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateFavorite).not.toHaveBeenCalled();
  expect(mockDeleteFavorite).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the event and then for the favorite of the user in the session", async () => {
  await favoriteEvent(eventId);

  expect(mockFindUniqueEvent).toHaveBeenCalledWith({ where: { id: eventId } });
  expect(mockFindUniqueFavorite).toHaveBeenCalledWith({ where: favoriteKey });
});

test("should return false and skip the favorite when the event does not exist", async () => {
  mockFindUniqueEvent.mockResolvedValue(null);

  const result = await favoriteEvent(eventId);

  expect(result).toBe(false);
  expect(mockFindUniqueFavorite).not.toHaveBeenCalled();
  expect(mockCreateFavorite).not.toHaveBeenCalled();
  expect(mockDeleteFavorite).not.toHaveBeenCalled();
});

/* - Testando o favorito novo - */

test("should create the favorite and return favorited as true when the event has not started", async () => {
  const result = await favoriteEvent(eventId);

  expect(mockCreateFavorite).toHaveBeenCalledTimes(1);
  expect(mockCreateFavorite).toHaveBeenCalledWith({ data: { userId: "user 1", eventId } });
  expect(mockDeleteFavorite).not.toHaveBeenCalled();
  expect(result).toEqual({ eventId, favorited: true });
});

test.each([
  ["the event already happened", { startsAt: pastStartsAt }],
  ["the event is cancelled", { isCancelled: true }],
])("should return false and skip the creation when %s", async (_description, overrides) => {
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent(overrides));

  const result = await favoriteEvent(eventId);

  expect(result).toBe(false);
  expect(mockCreateFavorite).not.toHaveBeenCalled();
});

/* - Testando a remoção do favorito - */

test("should delete the favorite and return favorited as false when the event is already favorited", async () => {
  mockFindUniqueFavorite.mockResolvedValue({ userId: "user 1", eventId });

  const result = await favoriteEvent(eventId);

  expect(mockDeleteFavorite).toHaveBeenCalledTimes(1);
  expect(mockDeleteFavorite).toHaveBeenCalledWith({ where: favoriteKey });
  expect(mockCreateFavorite).not.toHaveBeenCalled();
  expect(result).toEqual({ eventId, favorited: false });
});

test.each([
  ["the event already happened", { startsAt: pastStartsAt }],
  ["the event is cancelled", { isCancelled: true }],
])("should still delete the favorite when %s", async (_description, overrides) => {
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent(overrides));
  mockFindUniqueFavorite.mockResolvedValue({ userId: "user 1", eventId });

  const result = await favoriteEvent(eventId);

  expect(mockDeleteFavorite).toHaveBeenCalledWith({ where: favoriteKey });
  expect(result).toEqual({ eventId, favorited: false });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the event", () => mockFindUniqueEvent],
  ["looking for the favorite", () => mockFindUniqueFavorite],
  ["creating the favorite", () => mockCreateFavorite],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await favoriteEvent(eventId);

  expect(result).toBe(false);
});

test("should return false when deleting the favorite fails", async () => {
  mockFindUniqueFavorite.mockResolvedValue({ userId: "user 1", eventId });
  mockDeleteFavorite.mockRejectedValue(new Error("db error"));

  const result = await favoriteEvent(eventId);

  expect(result).toBe(false);
});
