import { beforeEach, vi, type Mock } from "vitest";
import { getTicketIncome } from "@/actions/admin/analytics-management/getTicketIncome";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas - */

vi.mock("@/actions/admin/checkIsAdmin", () => ({ checkIsAdmin: vi.fn() }));

vi.mock("@/shared/utils/functions/dates", () => ({ formattedStringToDate: vi.fn() }));

vi.mock("@/lib/server/services/prisma", () => ({
  prisma: {
    ticket: { findMany: vi.fn() },
  },
}));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockFormattedStringToDate = formattedStringToDate as unknown as Mock;
const mockFindMany = prisma.ticket.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type TicketIncomeInput = Parameters<typeof getTicketIncome>[0];

const intervalStart = Date.UTC(2026, 0, 1);
const intervalEnd = Date.UTC(2026, 1, 1);

const buildInput = (overrides: Partial<TicketIncomeInput> = {}): TicketIncomeInput => ({
  label: "this month",
  tag: "rock",
  ...overrides,
});

// O unitPrice do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildTicket = (quantity: number, unitPrice: number) => ({
  quantity,
  unitPrice: { toNumber: () => unitPrice },
});

beforeEach(() => {
  vi.clearAllMocks();

  mockCheckIsAdmin.mockResolvedValue(true);
  mockFormattedStringToDate.mockReturnValue({ intervalStart, intervalEnd });
  mockFindMany.mockResolvedValue([]);
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getTicketIncome(buildInput());

  expect(result).toBe(false);
  expect(mockFindMany).not.toHaveBeenCalled();
});

test.each([
  ["an unknown label", { label: "invalid" }],
  ["an unknown tag", { tag: "invalid" }],
  ["the all_tags option", { tag: "all_tags" }],
  ["an empty event name", { name: "" }],
  ["an event name over 30 characters", { name: "a".repeat(31) }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await getTicketIncome(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFormattedStringToDate).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should convert the selected label into an interval", async () => {
  await getTicketIncome(buildInput({ label: "this year" }));

  expect(mockFormattedStringToDate).toHaveBeenCalledWith("this year");
});

test("should look for tickets of the selected tag paid inside the interval", async () => {
  await getTicketIncome(buildInput({ tag: "pop" }));

  expect(mockFindMany).toHaveBeenCalledWith({
    where: {
      event: { tag: "pop" },
      order: {
        ticketPayments: {
          some: { status: "confirmed", confirmedAt: { gte: new Date(intervalStart), lt: new Date(intervalEnd) } },
        },
      },
    },
    select: { quantity: true, unitPrice: true },
  });
});

test("should also filter by the event title when a name is given", async () => {
  await getTicketIncome(buildInput({ name: "Rock in Rio" }));

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ event: { tag: "rock", title: "Rock in Rio" } }),
    }),
  );
});

test("should not filter by the event title when no name is given", async () => {
  await getTicketIncome(buildInput());

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ event: { tag: "rock" } }),
    }),
  );
});

test("should return false when fetching tickets fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  const result = await getTicketIncome(buildInput());

  expect(result).toBe(false);
});

/* - Testando o cálculo da receita - */

test("should return zero income when there are no tickets", async () => {
  const result = await getTicketIncome(buildInput());

  expect(result).toEqual({ totalIncome: 0 });
});

test("should multiply the quantity by the unit price", async () => {
  mockFindMany.mockResolvedValue([buildTicket(2, 50)]);

  const result = await getTicketIncome(buildInput());

  expect(result).toEqual({ totalIncome: 100 });
});

test("should sum the income of every ticket", async () => {
  mockFindMany.mockResolvedValue([buildTicket(2, 50), buildTicket(3, 25.5), buildTicket(1, 120)]);

  const result = await getTicketIncome(buildInput());

  // (2 x 50) + (3 x 25.5) + (1 x 120) => 100 + 76.5 + 120 = 296.5

  expect(result).toEqual({ totalIncome: 296.5 });
});

test("should return zero income when the tickets are free", async () => {
  mockFindMany.mockResolvedValue([buildTicket(5, 0)]);

  const result = await getTicketIncome(buildInput());

  expect(result).toEqual({ totalIncome: 0 });
});

test("should avoid floating point errors when summing prices with cents", async () => {
  mockFindMany.mockResolvedValue([buildTicket(3, 19.9)]);

  const result = await getTicketIncome(buildInput());

  // 3 x 19.9 dá 59.699999999999996 em JavaScript, o esperado é 59.7

  expect(result).toEqual({ totalIncome: 59.7 });
});
