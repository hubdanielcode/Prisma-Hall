import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { checkIsAdmin, getNewVisitors } from "@/actions";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/server";
import { tagSchema } from "@/lib/validations/shared/tagSchema";

/* - Mocks das dependências externas - */

vi.mock("@/actions/admin/checkIsAdmin", () => ({ checkIsAdmin: vi.fn() }));

vi.mock("@/shared/utils/functions/dates", () => ({ formattedStringToDate: vi.fn() }));

vi.mock("@/lib/server/services/prisma", () => ({
  prisma: {
    user: { count: vi.fn() },
    ticketPayment: { findMany: vi.fn() },
  },
}));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockFormattedStringToDate = formattedStringToDate as unknown as Mock;
const mockUserCount = prisma.user.count as unknown as Mock;
const mockFindMany = prisma.ticketPayment.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type NewVisitorInput = Parameters<typeof getNewVisitors>[0];

const intervalStart = Date.UTC(2026, 0, 1);
const intervalEnd = Date.UTC(2026, 1, 1);

const buildInput = (overrides: Partial<NewVisitorInput> = {}): NewVisitorInput => ({
  label: "this month",
  tag: "all_tags",
  ...overrides,
});

const buildPayment = (userId: string, confirmedAt: Date | null, tags: string[]) => ({
  userId,
  confirmedAt,
  order: { tickets: tags.map((tag) => ({ event: { tag } })) },
});

// Monta o buyersByTag esperado (todas as tags, na ordem do tagSchema), com 0 para as que não aparecem em counts

const buildBuyersByTag = (counts: Record<string, number> = {}) => tagSchema.options.map((tag) => ({ tag, totalBuyers: counts[tag] ?? 0 }));

// Primeiras compras de cada usuário, usadas em vários testes

const payments = [
  buildPayment("user 1", new Date("2026-01-10"), ["rock"]),
  buildPayment("user 2", new Date("2026-01-15"), ["rock", "pop"]),
  buildPayment("user 3", new Date("2026-01-20"), ["pop"]),
  buildPayment("user 4", new Date("2025-12-20"), ["rock"]), // comprou antes do período
  buildPayment("user 5", new Date("2026-01-25"), ["rock", "rock"]), // dois ingressos da mesma tag
];

beforeEach(() => {
  vi.clearAllMocks();

  mockCheckIsAdmin.mockResolvedValue(true);
  mockFormattedStringToDate.mockReturnValue({ intervalStart, intervalEnd });
  mockUserCount.mockResolvedValue(0);
  mockFindMany.mockResolvedValue([]);
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getNewVisitors(buildInput());

  expect(result).toBe(false);
  expect(mockUserCount).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
});

test.each([
  ["label", { label: "invalid" }],
  ["tag", { tag: "invalid" }],
])("should return false and skip the database when the %s is invalid", async (_field, invalidInput) => {
  const result = await getNewVisitors(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFormattedStringToDate).not.toHaveBeenCalled();
  expect(mockUserCount).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should convert the selected label into an interval", async () => {
  await getNewVisitors(buildInput({ label: "this year" }));

  expect(mockFormattedStringToDate).toHaveBeenCalledWith("this year");
});

test("should count new users using the interval from the label", async () => {
  await getNewVisitors(buildInput());

  expect(mockUserCount).toHaveBeenCalledWith({
    where: { validatedAt: { gte: new Date(intervalStart), lt: new Date(intervalEnd) } },
  });
});

test("should look for the first confirmed payment of each user", async () => {
  await getNewVisitors(buildInput());

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { status: "confirmed", confirmedAt: { not: null } },
      distinct: ["userId"],
      orderBy: { confirmedAt: "asc" },
    }),
  );
});

test("should return false when counting users fails", async () => {
  mockUserCount.mockRejectedValue(new Error("db error"));

  const result = await getNewVisitors(buildInput());

  expect(result).toBe(false);
});

test("should return false when fetching payments fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  const result = await getNewVisitors(buildInput());

  expect(result).toBe(false);
});

/* - Testando o resultado com todas as tags - */

test("should return the new users count from the database", async () => {
  mockUserCount.mockResolvedValue(42);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ newUsers: 42 });
});

test("should count each buyer only once in the total", async () => {
  mockFindMany.mockResolvedValue(payments);

  const result = await getNewVisitors(buildInput());

  // user 1, user 2, user 3 e user 5 (o user 4 comprou antes do período)

  expect(result).toMatchObject({ buyers: 4 });
});

test("should return the buyers of every tag", async () => {
  mockFindMany.mockResolvedValue(payments);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ buyersByTag: buildBuyersByTag({ rock: 3, pop: 2 }) });
});

test("should return zeros when there are no payments", async () => {
  const result = await getNewVisitors(buildInput());

  expect(result).toEqual({ newUsers: 0, buyers: 0, buyersByTag: buildBuyersByTag() });
});

/* - Testando as regras de quem conta como comprador - */

test("should ignore users whose first purchase was before the interval start", async () => {
  mockFindMany.mockResolvedValue([buildPayment("old", new Date(intervalStart - 1), ["rock"])]);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ buyers: 0 });
});

test("should count a purchase made exactly at the interval start", async () => {
  mockFindMany.mockResolvedValue([buildPayment("user 1", new Date(intervalStart), ["rock"])]);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ buyers: 1 });
});

test("should ignore payments without a confirmation date", async () => {
  mockFindMany.mockResolvedValue([buildPayment("user 1", null, ["rock"])]);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ buyers: 0 });
});

test("should count a buyer once per tag even with several tickets of the same tag", async () => {
  mockFindMany.mockResolvedValue([buildPayment("user 1", new Date("2026-01-10"), ["rock", "rock", "rock"])]);

  const result = await getNewVisitors(buildInput({ tag: "rock" }));

  expect(result).toMatchObject({ buyers: 1, buyersByTag: [{ tag: "rock", totalBuyers: 1 }] });
});

test("should count a buyer in every tag they bought but once in the total", async () => {
  mockFindMany.mockResolvedValue([buildPayment("user 1", new Date("2026-01-10"), ["rock", "pop"])]);

  const result = await getNewVisitors(buildInput());

  expect(result).toMatchObject({ buyers: 1, buyersByTag: buildBuyersByTag({ rock: 1, pop: 1 }) });
});

/* - Testando o resultado com uma tag específica - */

test("should return only the selected tag in buyersByTag", async () => {
  mockFindMany.mockResolvedValue(payments);

  const result = await getNewVisitors(buildInput({ tag: "pop" }));

  expect(result).toMatchObject({ buyersByTag: [{ tag: "pop", totalBuyers: 2 }] });
});

test("should use the buyers of the selected tag as the buyers total", async () => {
  mockFindMany.mockResolvedValue(payments);

  const result = await getNewVisitors(buildInput({ tag: "rock" }));

  expect(result).toMatchObject({ buyers: 3 });
});

test("should return zero buyers when nobody bought the selected tag", async () => {
  mockUserCount.mockResolvedValue(7);
  mockFindMany.mockResolvedValue(payments);

  const result = await getNewVisitors(buildInput({ tag: "metal" }));

  expect(result).toEqual({ newUsers: 7, buyers: 0, buyersByTag: [{ tag: "metal", totalBuyers: 0 }] });
});
