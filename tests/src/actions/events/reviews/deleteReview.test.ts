import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { deleteReview } from "@/actions/events/reviews/deleteReview";
import { prisma } from "@/lib/server/services/prisma";
import { recalculateEventRating, recalculateUserBadges } from "@/lib/server";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return { prisma, recalculateEventRating: vi.fn(), recalculateUserBadges: vi.fn() };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockRecalculateEventRating = recalculateEventRating as unknown as Mock;
const mockRecalculateUserBadges = recalculateUserBadges as unknown as Mock;
const mockFindUnique = prisma.review.findUnique as unknown as Mock;
const mockDelete = prisma.review.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const reviewId = "550e8400-e29b-41d4-a716-446655440000";

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseReview = (overrides: Record<string, unknown> = {}) => ({
  id: reviewId,
  userId: "user 1",
  eventId: "event 1",
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUnique.mockResolvedValue(buildDatabaseReview());
  mockDelete.mockResolvedValue(buildDatabaseReview());
  mockRecalculateUserBadges.mockResolvedValue({ verifiedBadge: false });
  mockRecalculateEventRating.mockResolvedValue(true);
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await deleteReview(reviewId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await deleteReview(invalidId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the review by its id", async () => {
  await deleteReview(reviewId);

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: reviewId } });
});

test("should return false and skip the deletion and the recalculations when the review does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await deleteReview(reviewId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

test("should return false and skip the deletion and the recalculations when the review belongs to another user", async () => {
  mockFindUnique.mockResolvedValue(buildDatabaseReview({ userId: "user 2" }));

  const result = await deleteReview(reviewId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

/* - Testando a exclusão - */

test("should delete the review and return true", async () => {
  const result = await deleteReview(reviewId);

  expect(result).toBe(true);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith({ where: { id: reviewId } });
});

test("should recalculate the badges of the user and the rating of the event after deleting the review", async () => {
  await deleteReview(reviewId);

  expect(mockRecalculateUserBadges).toHaveBeenCalledWith("user 1");
  expect(mockRecalculateEventRating).toHaveBeenCalledWith("event 1");
  expect(mockDelete.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateUserBadges.mock.invocationCallOrder[0]);
  expect(mockDelete.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateEventRating.mock.invocationCallOrder[0]);
});

/* - Testando as falhas - */

test.each([
  ["looking for the review", () => mockFindUnique],
  ["deleting the review", () => mockDelete],
])("should return false and skip the recalculations when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await deleteReview(reviewId);

  expect(result).toBe(false);
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

test.each([
  ["recalculating the badges", () => mockRecalculateUserBadges],
  ["recalculating the rating of the event", () => mockRecalculateEventRating],
])("should return false when %s throws", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("recalculation error"));

  const result = await deleteReview(reviewId);

  expect(result).toBe(false);
});
