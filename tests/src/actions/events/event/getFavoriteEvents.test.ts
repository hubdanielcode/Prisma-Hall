import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getFavoriteEvents } from "@/actions/events/event/getFavoriteEvents";
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
const mockFindMany = prisma.favoriteEvent.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price e o rating do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "event 1",
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  attractionId: "attraction 1",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  isCancelled: false,
  price: { toNumber: () => 50 },
  startsAt: futureStartsAt,
  attendees: 120,
  rating: { toNumber: () => 4.5 },
  attraction: { id: "attraction 1", name: "Banda Prisma" },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildDatabaseFavorite = (eventOverrides: Record<string, unknown> = {}) => ({
  userId: "user 1",
  eventId: "event 1",
  event: buildDatabaseEvent(eventOverrides),
});

const expectedEvent = {
  id: "event 1",
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  attractionId: "attraction 1",
  attractionName: "Banda Prisma",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  status: "soon",
  price: 50,
  startsAt: "2099-01-01T20:00:00.000Z",
  attendees: 120,
  rating: 4.5,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getFavoriteEvents();

  expect(result).toBe(false);
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the favorites of the user in the session ordered by the date of the event", async () => {
  await getFavoriteEvents();

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: { event: { include: { attraction: { select: { id: true, name: true } } } } },
    orderBy: { event: { startsAt: "asc" } },
  });
});

/* - Testando o resultado - */

test("should return an empty list when the user has no favorites", async () => {
  const result = await getFavoriteEvents();

  expect(result).toEqual([]);
});

test("should return the favorite event with the attraction data, the price and the rating as numbers and the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseFavorite()]);

  const result = await getFavoriteEvents();

  expect(result).toEqual([expectedEvent]);
});

test.each([
  ["an event that has not started", { startsAt: futureStartsAt }, "soon"],
  ["an event that already happened", { startsAt: pastStartsAt }, "happened"],
  ["a cancelled event that has not started", { isCancelled: true, startsAt: futureStartsAt }, "cancelled"],
  ["a cancelled event that already happened", { isCancelled: true, startsAt: pastStartsAt }, "cancelled"],
])("should return the status according to the date and the cancellation when it is %s", async (_description, eventOverrides, expectedStatus) => {
  mockFindMany.mockResolvedValue([buildDatabaseFavorite(eventOverrides)]);

  const result = await getFavoriteEvents();

  expect(result).not.toBe(false);
  expect((result as { status: string }[])[0].status).toBe(expectedStatus);
});

test("should return every favorite event in the same order as the database", async () => {
  mockFindMany.mockResolvedValue([
    buildDatabaseFavorite({ id: "event 1", title: "Rock na Praça" }),
    buildDatabaseFavorite({ id: "event 2", title: "Jazz na Praça" }),
    buildDatabaseFavorite({ id: "event 3", title: "Samba na Praça" }),
  ]);

  const result = await getFavoriteEvents();

  expect(result).toEqual([
    { ...expectedEvent, id: "event 1", title: "Rock na Praça" },
    { ...expectedEvent, id: "event 2", title: "Jazz na Praça" },
    { ...expectedEvent, id: "event 3", title: "Samba na Praça" },
  ]);
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the favorite events fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getFavoriteEvents()).rejects.toThrow("Erro ao buscar eventos favoritos.");
});
