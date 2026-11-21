import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getVoucherIncome } from "@/actions/admin/analytics-management/getVoucherIncome";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { formattedStringToDate } from "@/shared/utils/functions/dates";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

vi.mock("@/shared/utils/functions/dates", () => ({ formattedStringToDate: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockFormattedStringToDate = formattedStringToDate as unknown as Mock;
const mockFindMany = prisma.voucher.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type VoucherIncomeInput = Parameters<typeof getVoucherIncome>[0];

const intervalStart = Date.UTC(2026, 0, 1);
const intervalEnd = Date.UTC(2026, 1, 1);

const buildInput = (overrides: Partial<VoucherIncomeInput> = {}): VoucherIncomeInput => ({
  label: "this month",
  category: "beers",
  ...overrides,
});

// O price do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildVoucher = (productName: string, price: number, quantity: number) => ({
  quantity,
  product: { name: productName, price: { toNumber: () => price } },
});

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFormattedStringToDate.mockReturnValue({ intervalStart, intervalEnd });
  mockFindMany.mockResolvedValue([]);
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getVoucherIncome(buildInput());

  expect(result).toBe(false);
  expect(mockFindMany).not.toHaveBeenCalled();
});

test.each([
  ["an unknown label", { label: "invalid" }],
  ["an unknown category", { category: "invalid" }],
  ["an empty product name", { name: "" }],
  ["a product name over 30 characters", { name: "a".repeat(31) }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await getVoucherIncome(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFormattedStringToDate).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should convert the selected label into an interval", async () => {
  await getVoucherIncome(buildInput({ label: "this year" }));

  expect(mockFormattedStringToDate).toHaveBeenCalledWith("this year");
});

test("should look for vouchers of the selected category paid since the interval start", async () => {
  await getVoucherIncome(buildInput({ category: "cocktails" }));

  expect(mockFindMany).toHaveBeenCalledWith({
    where: {
      order: { voucherPayments: { some: { status: "confirmed", createdAt: { gte: new Date(intervalStart) } } } },
      product: { category: "cocktails" },
    },
    select: {
      quantity: true,
      product: { select: { name: true, price: true } },
    },
  });
});

test.each([
  ["a name is given", { name: "Heineken" }, { category: "beers", name: "Heineken" }],
  ["no name is given", {}, { category: "beers" }],
])("should build the product filter correctly when %s", async (_description, overrides, expectedProduct) => {
  await getVoucherIncome(buildInput(overrides));

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ product: expectedProduct }),
    }),
  );
});

test("should return false when fetching vouchers fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  const result = await getVoucherIncome(buildInput());

  expect(result).toBe(false);
});

/* - Testando o cálculo da receita - */

test.each([
  ["there are no vouchers", [], { totalIncome: 0, products: [] }],
  ["the vouchers are free", [buildVoucher("Água", 0, 5)], { totalIncome: 0, products: [{ name: "Água", income: 0 }] }],
  ["there is a single voucher", [buildVoucher("Heineken", 10, 3)], { totalIncome: 30, products: [{ name: "Heineken", income: 30 }] }],
  [
    "vouchers are from the same product",
    [buildVoucher("Heineken", 10, 2), buildVoucher("Heineken", 10, 3)],
    { totalIncome: 50, products: [{ name: "Heineken", income: 50 }] },
  ],
  // Heineken: (2 x 10) + (1 x 10) = 30, Corona: 4 x 12.5 = 50
  [
    "there are several products",
    [buildVoucher("Heineken", 10, 2), buildVoucher("Corona", 12.5, 4), buildVoucher("Heineken", 10, 1)],
    {
      totalIncome: 80,
      products: [
        { name: "Heineken", income: 30 },
        { name: "Corona", income: 50 },
      ],
    },
  ],
])("should return the correct income and products when %s", async (_description, vouchers, expected) => {
  mockFindMany.mockResolvedValue(vouchers);

  const result = await getVoucherIncome(buildInput());

  expect(result).toEqual(expected);
});
