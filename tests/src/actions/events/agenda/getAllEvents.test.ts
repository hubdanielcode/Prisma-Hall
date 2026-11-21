import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getAllEvents } from "@/actions/events/agenda/getAllEvents";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus };
});

const mockFindMany = prisma.event.findMany as unknown as Mock;

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
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a consulta ao banco - */

test("should look for all the events with the id and the name of the attraction", async () => {
  await getAllEvents();

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith({ include: { attraction: { select: { id: true, name: true } } } });
});

/* - Testando o resultado - */

test("should return an empty list when there are no events", async () => {
  const result = await getAllEvents();

  expect(result).toEqual([]);
});

test("should return the event with the attraction data, the price and the rating as numbers and the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseEvent()]);

  const result = await getAllEvents();

  expect(result).toEqual([expectedEvent]);
});

test.each([
  ["an event that has not started", { startsAt: futureStartsAt }, "soon"],
  ["an event that already happened", { startsAt: pastStartsAt }, "happened"],
  ["a cancelled event that has not started", { isCancelled: true, startsAt: futureStartsAt }, "cancelled"],
  ["a cancelled event that already happened", { isCancelled: true, startsAt: pastStartsAt }, "cancelled"],
])("should return the status according to the date and the cancellation when it is %s", async (_description, overrides, expectedStatus) => {
  mockFindMany.mockResolvedValue([buildDatabaseEvent(overrides)]);

  const result = await getAllEvents();

  expect(result[0].status).toBe(expectedStatus);
});

test.each([
  ["a free event with no rating", 0, 0],
  ["an event with cents and a decimal rating", 19.9, 3.7],
])("should convert the price and the rating to numbers when the event is %s", async (_description, price, rating) => {
  mockFindMany.mockResolvedValue([buildDatabaseEvent({ price: { toNumber: () => price }, rating: { toNumber: () => rating } })]);

  const result = await getAllEvents();

  expect(result).toEqual([{ ...expectedEvent, price, rating }]);
});

test("should return every event in the same order as the database", async () => {
  mockFindMany.mockResolvedValue([
    buildDatabaseEvent({ id: "event 1", title: "Rock na Praça" }),
    buildDatabaseEvent({ id: "event 2", title: "Jazz na Praça" }),
    buildDatabaseEvent({ id: "event 3", title: "Samba na Praça" }),
  ]);

  const result = await getAllEvents();

  expect(result).toEqual([
    { ...expectedEvent, id: "event 1", title: "Rock na Praça" },
    { ...expectedEvent, id: "event 2", title: "Jazz na Praça" },
    { ...expectedEvent, id: "event 3", title: "Samba na Praça" },
  ]);
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the events fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getAllEvents()).rejects.toThrow("Erro ao buscar eventos.");
});
