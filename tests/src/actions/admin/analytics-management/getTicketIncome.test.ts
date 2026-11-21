import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getTicketIncome } from "@/actions/admin/analytics-management/getTicketIncome";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

vi.mock("@/shared/utils/functions/dates", () => ({ formattedStringToDate: vi.fn() }));

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

test.each([
  ["a name is given", { name: "Rock in Rio" }, { tag: "rock", title: "Rock in Rio" }],
  ["no name is given", {}, { tag: "rock" }],
])("should build the event filter correctly when %s", async (_description, overrides, expectedEvent) => {
  await getTicketIncome(buildInput(overrides));

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ event: expectedEvent }),
    }),
  );
});

test("should return false when fetching tickets fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  const result = await getTicketIncome(buildInput());

  expect(result).toBe(false);
});

/* - Testando o cálculo da receita - */

test.each([
  ["there are no tickets", [], 0],
  ["the tickets are free", [buildTicket(5, 0)], 0],
  ["there is a single ticket", [buildTicket(2, 50)], 100], // (2 x 50) + (3 x 25.5) + (1 x 120) => 100 + 76.5 + 120 = 296.5
  ["there are several tickets", [buildTicket(2, 50), buildTicket(3, 25.5), buildTicket(1, 120)], 296.5], // 3 x 19.9 = 59.699999999999996 em JS, o esperado é 59.7
  ["the prices have cents", [buildTicket(3, 19.9)], 59.7],
])("should return the correct total income when %s", async (_description, tickets, expectedIncome) => {
  mockFindMany.mockResolvedValue(tickets);

  const result = await getTicketIncome(buildInput());

  expect(result).toEqual({ totalIncome: expectedIncome });
});
