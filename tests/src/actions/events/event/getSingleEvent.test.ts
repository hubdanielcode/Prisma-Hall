import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getSingleEvent } from "@/actions/events/event/getSingleEvent";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus };
});

const mockFindUnique = prisma.event.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

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
  mockFindUnique.mockResolvedValue(buildDatabaseEvent());
});

/* - Testando a consulta ao banco - */

test("should look for the event by its id with the id and the name of the attraction", async () => {
  await getSingleEvent("event 9");

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "event 9" }, include: { attraction: { select: { id: true, name: true } } } });
});

test("should return false when the event does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await getSingleEvent("event 1");

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the event with the attraction data, the price and the rating as numbers and the dates as strings", async () => {
  const result = await getSingleEvent("event 1");

  expect(result).toEqual(expectedEvent);
});

test.each([
  ["an event that has not started", { startsAt: futureStartsAt }, "soon"],
  ["an event that already happened", { startsAt: pastStartsAt }, "happened"],
  ["a cancelled event that has not started", { isCancelled: true, startsAt: futureStartsAt }, "cancelled"],
  ["a cancelled event that already happened", { isCancelled: true, startsAt: pastStartsAt }, "cancelled"],
])("should return the status according to the date and the cancellation when it is %s", async (_description, overrides, expectedStatus) => {
  mockFindUnique.mockResolvedValue(buildDatabaseEvent(overrides));

  const result = await getSingleEvent("event 1");

  expect(result).toEqual({ ...expectedEvent, startsAt: overrides.startsAt.toISOString(), status: expectedStatus });
});

test.each([
  ["a free event with no rating", 0, 0],
  ["an event with cents and a decimal rating", 19.9, 3.7],
])("should convert the price and the rating to numbers when the event is %s", async (_description, price, rating) => {
  mockFindUnique.mockResolvedValue(buildDatabaseEvent({ price: { toNumber: () => price }, rating: { toNumber: () => rating } }));

  const result = await getSingleEvent("event 1");

  expect(result).toEqual({ ...expectedEvent, price, rating });
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the event fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  await expect(getSingleEvent("event 1")).rejects.toThrow("Erro ao buscar evento.");
});
