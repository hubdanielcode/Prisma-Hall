import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { postReview } from "@/actions/events/reviews/postReview";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/internal/prismaNamespace";
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
const mockFindFirstTicket = prisma.ticket.findFirst as unknown as Mock;
const mockFindFirstEvent = prisma.event.findFirst as unknown as Mock;
const mockCreateReview = prisma.review.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type PostReviewInput = Parameters<typeof postReview>[0];

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildInput = (overrides: Partial<PostReviewInput> = {}): PostReviewInput => ({
  eventId,
  rating: 5,
  comment: "Show incrível",
  ...overrides,
});

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O rating do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDatabaseReview = (overrides: Record<string, unknown> = {}) => ({
  id: "review 1",
  userId: "user 1",
  eventId,
  rating: { toNumber: () => 5 },
  comment: "Show incrível",
  event: { title: "Rock na Praça" },
  user: { name: "Maria Silva", profilePicture: "https://blob.vercel-storage.com/maria.png", verifiedBadge: false },
  createdAt: new Date("2026-01-15T17:59:00.000Z"),
  updatedAt: new Date("2026-01-15T17:59:30.000Z"),
  ...overrides,
});

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindFirstTicket.mockResolvedValue({ id: "ticket 1" });
  mockFindFirstEvent.mockResolvedValue({ id: eventId });
  mockCreateReview.mockResolvedValue(buildDatabaseReview());
  mockRecalculateUserBadges.mockResolvedValue({ verifiedBadge: false });
  mockRecalculateEventRating.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await postReview(buildInput());

  expect(result).toBe(false);
  expect(mockFindFirstTicket).not.toHaveBeenCalled();
  expect(mockCreateReview).not.toHaveBeenCalled();
});

test.each([
  ["an event id that is not a uuid", { eventId: "not-a-uuid" }],
  ["a rating below 1", { rating: 0 }],
  ["a rating above 5", { rating: 6 }],
  ["a rating that is not an integer", { rating: 3.5 }],
  ["no rating", { rating: undefined }],
  ["a comment above 150 characters", { comment: "a".repeat(151) }],
  ["a comment with an emoji", { comment: "Muito bom 😀" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await postReview(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindFirstTicket).not.toHaveBeenCalled();
  expect(mockFindFirstEvent).not.toHaveBeenCalled();
  expect(mockCreateReview).not.toHaveBeenCalled();
});

/* - Testando a participação no evento - */

test("should look for an active ticket of the user in the event with a confirmed order", async () => {
  await postReview(buildInput());

  expect(mockFindFirstTicket).toHaveBeenCalledTimes(1);
  expect(mockFindFirstTicket).toHaveBeenCalledWith({
    where: { userId: "user 1", eventId, status: "active", order: { status: "confirmed" } },
    select: { id: true },
  });
});

test("should return false and skip the event and the review when the user has no valid ticket", async () => {
  mockFindFirstTicket.mockResolvedValue(null);

  const result = await postReview(buildInput());

  expect(result).toBe(false);
  expect(mockFindFirstEvent).not.toHaveBeenCalled();
  expect(mockCreateReview).not.toHaveBeenCalled();
});

test("should look for the event only when it is not cancelled and has already started", async () => {
  await postReview(buildInput());

  expect(mockFindFirstEvent).toHaveBeenCalledWith({
    where: { id: eventId, isCancelled: false, startsAt: { lt: now } },
    select: { id: true },
  });
});

test("should return false and skip the review when the event is cancelled or has not happened yet", async () => {
  mockFindFirstEvent.mockResolvedValue(null);

  const result = await postReview(buildInput());

  expect(result).toBe(false);
  expect(mockCreateReview).not.toHaveBeenCalled();
});

/* - Testando a criação - */

test("should create the review with the data of the input and the user in the session", async () => {
  await postReview(buildInput({ rating: 4, comment: "Ótima noite" }));

  expect(mockCreateReview).toHaveBeenCalledTimes(1);
  expect(mockCreateReview).toHaveBeenCalledWith({
    data: { userId: "user 1", eventId, rating: 4, comment: "Ótima noite" },

    include: {
      event: { select: { title: true } },
      user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
    },
  });
});

test("should create the review without a comment when the input has none", async () => {
  await postReview(buildInput({ comment: undefined }));

  expect(mockCreateReview.mock.calls[0][0].data.comment).toBeUndefined();
});

test("should recalculate the badges of the user and then the rating of the event after creating the review", async () => {
  await postReview(buildInput());

  expect(mockRecalculateUserBadges).toHaveBeenCalledWith("user 1");
  expect(mockRecalculateEventRating).toHaveBeenCalledWith(eventId);
  expect(mockCreateReview.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateUserBadges.mock.invocationCallOrder[0]);
  expect(mockRecalculateUserBadges.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateEventRating.mock.invocationCallOrder[0]);
});

/* - Testando o resultado - */

test("should return the created review with the event and the user data, the rating as a number and the dates as strings", async () => {
  const result = await postReview(buildInput());

  expect(result).toEqual({
    id: "review 1",
    userId: "user 1",
    eventId,
    rating: 5,
    comment: "Show incrível",
    eventName: "Rock na Praça",
    userName: "Maria Silva",
    userPhoto: "https://blob.vercel-storage.com/maria.png",
    verifiedBadge: false,
    createdAt: "2026-01-15T17:59:00.000Z",
    updatedAt: "2026-01-15T17:59:30.000Z",
  });
});

test.each([
  ["the recalculation gives the badge", { verifiedBadge: true }, false, true],
  ["the recalculation takes the badge", { verifiedBadge: false }, true, false],
  ["the recalculation fails", false, true, true],
  ["the recalculation fails and the user has no badge", false, false, false],
])("should return the verified badge as expected when %s", async (_description, recalculatedBadges, currentBadge, expectedBadge) => {
  mockRecalculateUserBadges.mockResolvedValue(recalculatedBadges);
  mockCreateReview.mockResolvedValue(buildDatabaseReview({ user: { name: "Maria Silva", profilePicture: null, verifiedBadge: currentBadge } }));

  const result = await postReview(buildInput());

  expect(result).toMatchObject({ verifiedBadge: expectedBadge });
});

/* - Testando as falhas do banco - */

test("should return already_reviewed when the user already reviewed the event", async () => {
  mockCreateReview.mockRejectedValue(buildPrismaError("P2002", { target: ["user_id", "event_id"] }));

  const result = await postReview(buildInput());

  expect(result).toBe("already_reviewed");
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

test.each([
  ["a unique error from another field", buildPrismaError("P2002", { target: ["event_id"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["user_id"] })],
  ["an unknown error", new Error("db error")],
])("should return false when creating the review fails with %s", async (_description, error) => {
  mockCreateReview.mockRejectedValue(error);

  const result = await postReview(buildInput());

  expect(result).toBe(false);
});

test.each([
  ["looking for the ticket", () => mockFindFirstTicket],
  ["looking for the event", () => mockFindFirstEvent],
  ["recalculating the badges", () => mockRecalculateUserBadges],
  ["recalculating the rating of the event", () => mockRecalculateEventRating],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await postReview(buildInput());

  expect(result).toBe(false);
});
