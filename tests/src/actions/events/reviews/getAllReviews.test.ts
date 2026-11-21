import { beforeEach, expect, test, type Mock } from "vitest";
import { getAllReviews } from "@/actions/events/reviews/getAllReviews";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

const mockAggregate = prisma.review.aggregate as unknown as Mock;
const mockFindMany = prisma.review.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type GetAllReviewsInput = Parameters<typeof getAllReviews>[0];

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const userId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

const buildInput = (overrides: Partial<GetAllReviewsInput> = {}): GetAllReviewsInput => ({
  currentPage: 1,
  itemsPerPage: 10,
  ...overrides,
});

// O rating do Prisma é um Decimal, por isso os mocks têm o método toNumber

const buildAggregate = (total: number, average: number | null) => ({
  _avg: { rating: average === null ? null : { toNumber: () => average } },
  _count: { _all: total },
});

const buildDatabaseReview = (overrides: Record<string, unknown> = {}) => ({
  id: "review 1",
  userId: "user 1",
  eventId: "event 1",
  rating: { toNumber: () => 4 },
  comment: "Show incrível",
  event: { title: "Rock na Praça" },
  user: { name: "Maria Silva", profilePicture: "https://blob.vercel-storage.com/maria.png", verifiedBadge: true },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const expectedReview = {
  id: "review 1",
  userId: "user 1",
  eventId: "event 1",
  rating: 4,
  comment: "Show incrível",
  eventName: "Rock na Praça",
  userName: "Maria Silva",
  userPhoto: "https://blob.vercel-storage.com/maria.png",
  verifiedBadge: true,
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

beforeEach(() => {
  mockAggregate.mockResolvedValue(buildAggregate(0, null));
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a validação - */

test.each([
  ["a page below 1", { currentPage: 0 }],
  ["a page that is not an integer", { currentPage: 1.5 }],
  ["no items per page", { itemsPerPage: 0 }],
  ["more than 50 items per page", { itemsPerPage: 51 }],
  ["an items per page that is not an integer", { itemsPerPage: 10.5 }],
  ["an event id that is not a uuid", { eventId: "not-a-uuid" }],
  ["a user id that is not a uuid", { userId: "not-a-uuid" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await getAllReviews(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockAggregate).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando os filtros - */

test.each([
  ["no filter", {}, {}],
  ["only the event", { eventId }, { eventId }],
  ["only the user", { userId }, { userId }],
  ["the event and the user", { eventId, userId }, { eventId, userId }],
])("should use the same where in the aggregate and in the list when there is %s", async (_description, filters, expectedWhere) => {
  await getAllReviews(buildInput(filters));

  expect(mockAggregate).toHaveBeenCalledWith({ where: expectedWhere, _avg: { rating: true }, _count: { _all: true } });
  expect(mockFindMany.mock.calls[0][0].where).toEqual(expectedWhere);
});

/* - Testando a paginação - */

test("should look for the first page of reviews with the event and the user data ordered by the newest first", async () => {
  await getAllReviews(buildInput({ currentPage: 1, itemsPerPage: 10 }));

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith({
    where: {},

    include: {
      event: { select: { title: true } },
      user: { select: { name: true, profilePicture: true, verifiedBadge: true } },
    },

    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: 0,
    take: 10,
  });
});

test.each([
  [2, 10, 10],
  [3, 10, 20],
  [4, 5, 15],
  [1, 50, 0],
])("should skip the reviews of the previous pages when the page is %i with %i items per page", async (currentPage, itemsPerPage, expectedSkip) => {
  await getAllReviews(buildInput({ currentPage, itemsPerPage }));

  expect(mockFindMany.mock.calls[0][0].skip).toBe(expectedSkip);
  expect(mockFindMany.mock.calls[0][0].take).toBe(itemsPerPage);
});

/* - Testando o resultado - */

test("should return an empty page with the total and the average as zero when there are no reviews", async () => {
  const result = await getAllReviews(buildInput());

  expect(result).toEqual({ reviews: [], total: 0, totalPages: 0, averageRating: 0 });
});

test("should return the review with the event and the user data, the rating as a number and the dates as strings", async () => {
  mockAggregate.mockResolvedValue(buildAggregate(1, 4));
  mockFindMany.mockResolvedValue([buildDatabaseReview()]);

  const result = await getAllReviews(buildInput());

  expect(result).toEqual({ reviews: [expectedReview], total: 1, totalPages: 1, averageRating: 4 });
});

test("should return every review in the same order as the database", async () => {
  mockAggregate.mockResolvedValue(buildAggregate(3, 4));
  mockFindMany.mockResolvedValue([
    buildDatabaseReview({ id: "review 1" }),
    buildDatabaseReview({ id: "review 2" }),
    buildDatabaseReview({ id: "review 3" }),
  ]);

  const result = await getAllReviews(buildInput());

  expect(result).not.toBe(false);
  expect((result as { reviews: { id: string }[] }).reviews.map((review) => review.id)).toEqual(["review 1", "review 2", "review 3"]);
});

test.each([
  [25, 10, 3],
  [20, 10, 2],
  [1, 10, 1],
  [7, 50, 1],
])("should return the total of %i reviews with %i items per page as %i pages", async (total, itemsPerPage, expectedTotalPages) => {
  mockAggregate.mockResolvedValue(buildAggregate(total, 4));

  const result = await getAllReviews(buildInput({ itemsPerPage }));

  expect(result).toMatchObject({ total, totalPages: expectedTotalPages });
});

test("should return the total and the average of all the reviews of the filter instead of only the ones of the page", async () => {
  mockAggregate.mockResolvedValue(buildAggregate(40, 3.5));
  mockFindMany.mockResolvedValue([buildDatabaseReview()]);

  const result = await getAllReviews(buildInput({ currentPage: 2, itemsPerPage: 10 }));

  expect(result).toMatchObject({ total: 40, totalPages: 4, averageRating: 3.5 });
});

test("should return the average as zero when the aggregate has no average", async () => {
  mockAggregate.mockResolvedValue(buildAggregate(0, null));

  const result = await getAllReviews(buildInput());

  expect(result).toMatchObject({ averageRating: 0 });
});

/* - Testando as falhas do banco - */

test("should throw an error and skip the list when the aggregate fails", async () => {
  mockAggregate.mockRejectedValue(new Error("db error"));

  await expect(getAllReviews(buildInput())).rejects.toThrow("Erro ao buscar avaliações.");
  expect(mockFindMany).not.toHaveBeenCalled();
});

test("should throw an error when fetching the reviews fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getAllReviews(buildInput())).rejects.toThrow("Erro ao buscar avaliações.");
});
