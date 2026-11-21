import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { updateReview } from "@/actions/events/reviews/updateReview";
import { prisma } from "@/lib/server/services/prisma";
import { recalculateEventRating, recalculateUserBadges } from "@/lib/server";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o reviewEditPolicy continua o real) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return { prisma, recalculateEventRating: vi.fn(), recalculateUserBadges: vi.fn() };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockRecalculateEventRating = recalculateEventRating as unknown as Mock;
const mockRecalculateUserBadges = recalculateUserBadges as unknown as Mock;
const mockFindUnique = prisma.review.findUnique as unknown as Mock;
const mockUpdate = prisma.review.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type UpdateReviewInput = Parameters<typeof updateReview>[0];

const reviewId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");
const minutes = (value: number) => value * 60 * 1000;

const buildInput = (overrides: Partial<UpdateReviewInput> = {}): UpdateReviewInput => ({
  reviewId,
  rating: 4,
  comment: "Mudei de ideia, foi ótimo",
  ...overrides,
});

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// A janela de edição é de 3 minutos, então a avaliação padrão foi criada há 1 minuto

const buildExistingReview = (overrides: Record<string, unknown> = {}) => ({
  id: reviewId,
  userId: "user 1",
  eventId: "event 1",
  createdAt: new Date(now.getTime() - minutes(1)),
  ...overrides,
});

// O rating do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildEditedReview = (overrides: Record<string, unknown> = {}) => ({
  id: reviewId,
  userId: "user 1",
  eventId: "event 1",
  rating: { toNumber: () => 4 },
  comment: "Mudei de ideia, foi ótimo",
  event: { title: "Rock na Praça" },
  user: { name: "Maria Silva", profilePicture: "https://blob.vercel-storage.com/maria.png", verifiedBadge: false },
  createdAt: new Date("2026-01-15T17:59:00.000Z"),
  updatedAt: new Date("2026-01-15T18:00:00.000Z"),
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUnique.mockResolvedValue(buildExistingReview());
  mockUpdate.mockResolvedValue(buildEditedReview());
  mockRecalculateUserBadges.mockResolvedValue({ verifiedBadge: false });
  mockRecalculateEventRating.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await updateReview(buildInput());

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

test.each([
  ["a review id that is not a uuid", { reviewId: "not-a-uuid" }],
  ["a rating below 1", { rating: 0 }],
  ["a rating above 5", { rating: 6 }],
  ["a rating that is not an integer", { rating: 3.5 }],
  ["a comment above 150 characters", { comment: "a".repeat(151) }],
  ["a comment with an emoji", { comment: "Muito bom 😀" }],
  ["no field to update", { rating: undefined, comment: undefined }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await updateReview(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the review by its id", async () => {
  await updateReview(buildInput());

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: reviewId } });
});

test.each([
  ["the review does not exist", null],
  ["the review belongs to another user", buildExistingReview({ userId: "user 2" })],
])("should return false and skip the update and the recalculations when %s", async (_description, existingReview) => {
  mockFindUnique.mockResolvedValue(existingReview);

  const result = await updateReview(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

/* - Testando a janela de edição - */

test.each([
  ["exactly 3 minutes ago", minutes(3)],
  ["more than 3 minutes ago", minutes(10)],
])("should return edit_window_expired and skip the update when the review was created %s", async (_description, age) => {
  mockFindUnique.mockResolvedValue(buildExistingReview({ createdAt: new Date(now.getTime() - age) }));

  const result = await updateReview(buildInput());

  expect(result).toBe("edit_window_expired");
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockRecalculateEventRating).not.toHaveBeenCalled();
});

test("should still update the review when it was created less than 3 minutes ago", async () => {
  mockFindUnique.mockResolvedValue(buildExistingReview({ createdAt: new Date(now.getTime() - minutes(3) + 1) }));

  await updateReview(buildInput());

  expect(mockUpdate).toHaveBeenCalledTimes(1);
});

/* - Testando a edição - */

test("should update the review with the rating and the comment of the input", async () => {
  await updateReview(buildInput({ rating: 4, comment: "Mudei de ideia, foi ótimo" }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: reviewId },
    data: { rating: 4, comment: "Mudei de ideia, foi ótimo" },

    include: {
      event: { select: { title: true } },
      user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
    },
  });
});

test.each([
  ["only the rating", { rating: 2, comment: undefined }],
  ["only the comment", { rating: undefined, comment: "Só o comentário" }],
  ["an empty comment", { rating: undefined, comment: "" }],
])("should update the review when the input has %s", async (_description, fields) => {
  await updateReview(buildInput(fields));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate.mock.calls[0][0].data).toEqual({ rating: fields.rating, comment: fields.comment });
});

test("should recalculate the badges of the user and then the rating of the event after updating the review", async () => {
  await updateReview(buildInput());

  expect(mockRecalculateUserBadges).toHaveBeenCalledWith("user 1");
  expect(mockRecalculateEventRating).toHaveBeenCalledWith("event 1");
  expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateUserBadges.mock.invocationCallOrder[0]);
  expect(mockRecalculateUserBadges.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateEventRating.mock.invocationCallOrder[0]);
});

/* - Testando o resultado - */

test("should return the updated review with the event and the user data, the rating as a number and the dates as strings", async () => {
  const result = await updateReview(buildInput());

  expect(result).toEqual({
    id: reviewId,
    userId: "user 1",
    eventId: "event 1",
    rating: 4,
    comment: "Mudei de ideia, foi ótimo",
    eventName: "Rock na Praça",
    userName: "Maria Silva",
    userPhoto: "https://blob.vercel-storage.com/maria.png",
    verifiedBadge: false,
    createdAt: "2026-01-15T17:59:00.000Z",
    updatedAt: "2026-01-15T18:00:00.000Z",
  });
});

test.each([
  ["the recalculation gives the badge", { verifiedBadge: true }, false, true],
  ["the recalculation takes the badge", { verifiedBadge: false }, true, false],
  ["the recalculation fails", false, true, true],
  ["the recalculation fails and the user has no badge", false, false, false],
])("should return the verified badge as expected when %s", async (_description, recalculatedBadges, currentBadge, expectedBadge) => {
  mockRecalculateUserBadges.mockResolvedValue(recalculatedBadges);
  mockUpdate.mockResolvedValue(buildEditedReview({ user: { name: "Maria Silva", profilePicture: null, verifiedBadge: currentBadge } }));

  const result = await updateReview(buildInput());

  expect(result).toMatchObject({ verifiedBadge: expectedBadge });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the review", () => mockFindUnique],
  ["updating the review", () => mockUpdate],
  ["recalculating the badges", () => mockRecalculateUserBadges],
  ["recalculating the rating of the event", () => mockRecalculateEventRating],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await updateReview(buildInput());

  expect(result).toBe(false);
});
