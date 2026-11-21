import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { recalculateOldUserBadges, recalculateUserBadges } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

// Limites fixos para os testes não dependerem dos valores reais das constantes

vi.mock("@/shared/utils/constants/achievementBadges", () => ({
  verifiedReviewsRequired: 3,
  frequentEventsByTier: { bronze: 3, silver: 10, gold: 25 },
  oldAccountYearsByTier: { bronze: 1, silver: 2, gold: 3 },
}));

const mockUserFindUnique = prisma.user.findUnique as unknown as Mock;
const mockUserFindMany = prisma.user.findMany as unknown as Mock;
const mockUserUpdate = prisma.user.update as unknown as Mock;
const mockUserUpdateMany = prisma.user.updateMany as unknown as Mock;
const mockReviewFindMany = prisma.review.findMany as unknown as Mock;
const mockTicketFindMany = prisma.ticket.findMany as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

/* - Funções e dados auxiliares - */

const userId = "7f9c2b1e-3a4d-4c8e-9b6a-1d2e3f4a5b6c";
const now = new Date("2026-06-15T12:00:00.000Z");

const buildEventIds = (count: number) => Array.from({ length: count }, (_, index) => `event ${index + 1}`);

const buildReviews = (eventIds: string[], comment: string | null = "Ótimo evento") => eventIds.map((eventId) => ({ eventId, comment }));

const buildTickets = (count: number) => buildEventIds(count).map((eventId) => ({ eventId }));

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  oldUser: "none",
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser());
  mockUserFindMany.mockResolvedValue([]);
  mockUserUpdate.mockResolvedValue({});
  mockReviewFindMany.mockResolvedValue([]);
  mockTicketFindMany.mockResolvedValue([]);
  mockTransaction.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando recalculateUserBadges: usuário - */

test("should look for the creation date of the user", async () => {
  await recalculateUserBadges(userId);

  expect(mockUserFindUnique).toHaveBeenCalledTimes(1);
  expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { id: userId }, select: { createdAt: true } });
});

test("should return false and skip the other queries when the user does not exist", async () => {
  mockUserFindUnique.mockResolvedValue(null);

  const result = await recalculateUserBadges(userId);

  expect(result).toBe(false);
  expect(mockReviewFindMany).not.toHaveBeenCalled();
  expect(mockTicketFindMany).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

/* - Testando recalculateUserBadges: consulta de avaliações e participações - */

test("should look only for the reviews of the user that have a comment", async () => {
  await recalculateUserBadges(userId);

  expect(mockReviewFindMany).toHaveBeenCalledTimes(1);
  expect(mockReviewFindMany).toHaveBeenCalledWith({
    where: { userId, comment: { not: null } },
    select: { eventId: true, comment: true },
  });
});

test("should look only for active tickets of confirmed orders from events that already happened and were not cancelled", async () => {
  await recalculateUserBadges(userId);

  expect(mockTicketFindMany).toHaveBeenCalledTimes(1);
  expect(mockTicketFindMany).toHaveBeenCalledWith({
    where: {
      userId,
      status: "active",
      order: { status: "confirmed" },
      event: { isCancelled: false, startsAt: { lt: now } },
    },
    select: { eventId: true },
    distinct: ["eventId"],
  });
});

/* - Testando recalculateUserBadges: badge de verificado - */

test.each([
  ["fewer reviewed events than required", 2, false],
  ["exactly the required reviewed events", 3, true],
  ["more reviewed events than required", 5, true],
])("should set verifiedBadge according to %s", async (_description, reviewedEventsCount, expectedVerifiedBadge) => {
  mockReviewFindMany.mockResolvedValue(buildReviews(buildEventIds(reviewedEventsCount)));

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ verifiedBadge: expectedVerifiedBadge }),
  });
});

test.each([
  ["a comment with only spaces", "   "],
  ["an empty comment", ""],
  ["a null comment", null],
])("should not count a review with %s for the verified badge", async (_description, comment) => {
  mockReviewFindMany.mockResolvedValue([...buildReviews(buildEventIds(2)), ...buildReviews(["event 3"], comment)]);

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ verifiedBadge: false }),
  });
});

test("should count several reviews of the same event as one for the verified badge", async () => {
  mockReviewFindMany.mockResolvedValue(buildReviews(["event 1", "event 1", "event 2", "event 2", "event 2"]));

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ verifiedBadge: false }),
  });
});

/* - Testando recalculateUserBadges: badge de frequente - */

test.each([
  ["no events", 0, "none"],
  ["one event less than bronze", 2, "none"],
  ["exactly the bronze limit", 3, "bronze"],
  ["one event less than silver", 9, "bronze"],
  ["exactly the silver limit", 10, "silver"],
  ["one event less than gold", 24, "silver"],
  ["exactly the gold limit", 25, "gold"],
  ["more events than the gold limit", 40, "gold"],
])("should set frequentUser according to %s", async (_description, participatedEventsCount, expectedLevel) => {
  mockTicketFindMany.mockResolvedValue(buildTickets(participatedEventsCount));

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ frequentUser: expectedLevel }),
  });
});

/* - Testando recalculateUserBadges: badge de antigo - */

test.each([
  ["an account created this year", "2026-01-10T12:00:00.000Z", "none"],
  ["an account whose first anniversary has not passed yet (next day)", "2025-06-16T12:00:00.000Z", "none"],
  ["an account whose first anniversary is today", "2025-06-15T12:00:00.000Z", "bronze"],
  ["an account whose first anniversary passed in a previous month", "2025-05-20T12:00:00.000Z", "bronze"],
  ["an account whose second anniversary has not passed yet (next day)", "2024-06-16T12:00:00.000Z", "bronze"],
  ["an account whose second anniversary is today", "2024-06-15T12:00:00.000Z", "silver"],
  ["an account whose third anniversary is today", "2023-06-15T12:00:00.000Z", "gold"],
  ["an account much older than the gold limit", "2020-01-01T12:00:00.000Z", "gold"],
])("should set oldUser according to %s", async (_description, createdAt, expectedLevel) => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ createdAt: new Date(createdAt) }));

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ oldUser: expectedLevel }),
  });
});

/* - Testando recalculateUserBadges: resultado - */

test("should save all the badges in the user and return them", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ createdAt: new Date("2024-06-15T12:00:00.000Z") }));
  mockReviewFindMany.mockResolvedValue(buildReviews(buildEventIds(3)));
  mockTicketFindMany.mockResolvedValue(buildTickets(10));

  const result = await recalculateUserBadges(userId);

  const expectedBadges = { verifiedBadge: true, frequentUser: "silver", oldUser: "silver" };

  expect(mockUserUpdate).toHaveBeenCalledTimes(1);
  expect(mockUserUpdate).toHaveBeenCalledWith({ where: { id: userId }, data: expectedBadges });
  expect(result).toEqual(expectedBadges);
});

/* - Testando recalculateUserBadges: falhas do banco - */

test.each([
  ["looking for the user", () => mockUserFindUnique],
  ["looking for the reviews", () => mockReviewFindMany],
  ["looking for the tickets", () => mockTicketFindMany],
  ["saving the badges", () => mockUserUpdate],
])("should return false when the database fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await recalculateUserBadges(userId);

  expect(result).toBe(false);
});

test("should not save the badges when looking for the reviews fails", async () => {
  mockReviewFindMany.mockRejectedValue(new Error("db error"));

  await recalculateUserBadges(userId);

  expect(mockUserUpdate).not.toHaveBeenCalled();
});

/* - Testando recalculateOldUserBadges: consulta ao banco - */

test("should look for the users that are not anonymized", async () => {
  await recalculateOldUserBadges();

  expect(mockUserFindMany).toHaveBeenCalledTimes(1);
  expect(mockUserFindMany).toHaveBeenCalledWith({
    where: { email: { not: { endsWith: "@prismahall.invalid" } } },
    select: { id: true, createdAt: true, oldUser: true },
  });
});

/* - Testando recalculateOldUserBadges: quem precisa ser atualizado - */

test("should run an empty transaction and return true when there are no users", async () => {
  const result = await recalculateOldUserBadges();

  expect(result).toBe(true);
  expect(mockUserUpdateMany).not.toHaveBeenCalled();
  expect(mockTransaction).toHaveBeenCalledWith([]);
});

test("should skip the users whose badge is already correct", async () => {
  mockUserFindMany.mockResolvedValue([
    buildDatabaseUser({ id: "user 1", createdAt: new Date("2023-06-15T12:00:00.000Z"), oldUser: "gold" }),
    buildDatabaseUser({ id: "user 2", createdAt: new Date("2026-01-10T12:00:00.000Z"), oldUser: "none" }),
  ]);

  const result = await recalculateOldUserBadges();

  expect(result).toBe(true);
  expect(mockUserUpdateMany).not.toHaveBeenCalled();
  expect(mockTransaction).toHaveBeenCalledWith([]);
});

test("should lower the badge of a user whose current badge is higher than the real one", async () => {
  mockUserFindMany.mockResolvedValue([buildDatabaseUser({ id: "user 1", createdAt: new Date("2026-01-10T12:00:00.000Z"), oldUser: "gold" })]);

  await recalculateOldUserBadges();

  expect(mockUserUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockUserUpdateMany).toHaveBeenCalledWith({ where: { id: { in: ["user 1"] } }, data: { oldUser: "none" } });
});

test("should update the changed users with one query per tier, all inside the same transaction", async () => {
  mockUserFindMany.mockResolvedValue([
    buildDatabaseUser({ id: "user 1", createdAt: new Date("2025-06-15T12:00:00.000Z"), oldUser: "none" }),
    buildDatabaseUser({ id: "user 2", createdAt: new Date("2025-01-01T12:00:00.000Z"), oldUser: "none" }),
    buildDatabaseUser({ id: "user 3", createdAt: new Date("2023-06-15T12:00:00.000Z"), oldUser: "silver" }),
    buildDatabaseUser({ id: "user 4", createdAt: new Date("2023-06-15T12:00:00.000Z"), oldUser: "gold" }),
  ]);
  mockUserUpdateMany.mockReturnValueOnce("bronze update").mockReturnValueOnce("gold update");

  await recalculateOldUserBadges();

  expect(mockUserUpdateMany).toHaveBeenCalledTimes(2);
  expect(mockUserUpdateMany).toHaveBeenNthCalledWith(1, { where: { id: { in: ["user 1", "user 2"] } }, data: { oldUser: "bronze" } });
  expect(mockUserUpdateMany).toHaveBeenNthCalledWith(2, { where: { id: { in: ["user 3"] } }, data: { oldUser: "gold" } });
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction).toHaveBeenCalledWith(["bronze update", "gold update"]);
});

/* - Testando recalculateOldUserBadges: resultado - */

test("should return true when the old user badges are updated", async () => {
  mockUserFindMany.mockResolvedValue([buildDatabaseUser({ createdAt: new Date("2025-06-15T12:00:00.000Z") })]);

  const result = await recalculateOldUserBadges();

  expect(result).toBe(true);
});

/* - Testando recalculateOldUserBadges: falhas do banco - */

test("should return false and skip the transaction when looking for the users fails", async () => {
  mockUserFindMany.mockRejectedValue(new Error("db error"));

  const result = await recalculateOldUserBadges();

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("should return false when the transaction fails", async () => {
  mockUserFindMany.mockResolvedValue([buildDatabaseUser({ createdAt: new Date("2025-06-15T12:00:00.000Z") })]);
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await recalculateOldUserBadges();

  expect(result).toBe(false);
});
