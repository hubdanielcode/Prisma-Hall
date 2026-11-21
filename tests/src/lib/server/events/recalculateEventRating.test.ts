import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { recalculateEventRating } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

const mockAggregate = prisma.review.aggregate as unknown as Mock;
const mockUpdate = prisma.event.update as unknown as Mock;

/* - Funções e dados auxiliares - */

const eventId = "3b1f7c2a-9d4e-4f6a-8c1b-5e2d7a9f0c34";

beforeEach(() => {
  mockAggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
  mockUpdate.mockResolvedValue({ id: eventId, rating: 4.5 });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando a consulta ao banco - */

test("should aggregate the average rating of the reviews of the event", async () => {
  await recalculateEventRating(eventId);

  expect(mockAggregate).toHaveBeenCalledTimes(1);
  expect(mockAggregate).toHaveBeenCalledWith({ where: { eventId }, _avg: { rating: true } });
});

test("should save the average rating in the event", async () => {
  await recalculateEventRating(eventId);

  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: eventId }, data: { rating: 4.5 } });
});

test("should reset the rating to 0 when the event has no reviews", async () => {
  mockAggregate.mockResolvedValue({ _avg: { rating: null } });

  await recalculateEventRating(eventId);

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: eventId }, data: { rating: 0 } });
});

/* - Testando o resultado - */

test("should return true when the rating is saved", async () => {
  const result = await recalculateEventRating(eventId);

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return false and skip the update when the aggregate fails", async () => {
  mockAggregate.mockRejectedValue(new Error("db error"));

  const result = await recalculateEventRating(eventId);

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should return false when the update fails", async () => {
  mockUpdate.mockRejectedValue(new Error("db error"));

  const result = await recalculateEventRating(eventId);

  expect(result).toBe(false);
});
