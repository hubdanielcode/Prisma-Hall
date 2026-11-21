import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getMyVouchers } from "@/actions/users/vouchers/getMyVouchers";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindManyVouchers = prisma.voucher.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const pickedUpAt = new Date("2026-01-17T12:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O unitPrice do Prisma é um Decimal, por isso o mock tem o método toNumber (o price do produto é diferente de propósito, para provar que o preço do voucher é o gravado na compra)

const buildPayment = (overrides: Record<string, unknown> = {}) => ({ status: "confirmed", pickedUpAt: null, ...overrides });

const buildDatabaseVoucher = (overrides: Record<string, unknown> = {}) => ({
  id: "voucher 1",
  userId: "user 1",
  orderId: "order 1",
  productId: "product 1",
  quantity: 2,
  unitPrice: { toNumber: () => 10 },

  product: {
    id: "product 1",
    name: "Heineken",
    category: "beers",
    description: "Cerveja long neck 330ml",
    image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
    price: { toNumber: () => 12.5 },
  },

  order: { status: "confirmed", voucherPayments: [buildPayment()] },
  createdAt: new Date("2026-01-12T12:00:00.000Z"),
  updatedAt: new Date("2026-01-13T12:00:00.000Z"),
  ...overrides,
});

const expectedVoucher = {
  id: "voucher 1",
  orderId: "order 1",
  productId: "product 1",
  quantity: 2,
  orderStatus: "confirmed",
  paymentStatus: "confirmed",
  pickedUpAt: null,

  product: {
    id: "product 1",
    name: "Heineken",
    category: "beers",
    description: "Cerveja long neck 330ml",
    image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
    price: 10,
  },

  createdAt: "2026-01-12T12:00:00.000Z",
  updatedAt: "2026-01-13T12:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindManyVouchers.mockResolvedValue([buildDatabaseVoucher()]);
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getMyVouchers();

  expect(result).toBe(false);
  expect(mockFindManyVouchers).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the vouchers of the user with the product and the latest payment, from the newest to the oldest", async () => {
  await getMyVouchers();

  expect(mockFindManyVouchers).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: {
      product: true,
      order: { include: { voucherPayments: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });
});

/* - Testando o resultado - */

test("should return the vouchers with the price as a number and the dates as ISO strings", async () => {
  const result = await getMyVouchers();

  expect(result).toEqual([expectedVoucher]);
});

test("should return the price saved in the voucher and not the current price of the product", async () => {
  const result = await getMyVouchers();

  expect(result).toEqual([expect.objectContaining({ product: expect.objectContaining({ price: 10 }) })]);
});

test("should return the payment as pending and no pickup when the order has no payment", async () => {
  mockFindManyVouchers.mockResolvedValue([buildDatabaseVoucher({ order: { status: "pending", voucherPayments: [] } })]);

  const result = await getMyVouchers();

  expect(result).toEqual([expect.objectContaining({ orderStatus: "pending", paymentStatus: "pending", pickedUpAt: null })]);
});

test("should return the pickup date as an ISO string when the pickup was registered", async () => {
  mockFindManyVouchers.mockResolvedValue([buildDatabaseVoucher({ order: { status: "confirmed", voucherPayments: [buildPayment({ pickedUpAt })] } })]);

  const result = await getMyVouchers();

  expect(result).toEqual([expect.objectContaining({ pickedUpAt: "2026-01-17T12:00:00.000Z" })]);
});

test("should keep the order that came from the database", async () => {
  mockFindManyVouchers.mockResolvedValue([buildDatabaseVoucher({ id: "voucher 2" }), buildDatabaseVoucher({ id: "voucher 1" })]);

  const result = await getMyVouchers();

  expect(result).toEqual([expect.objectContaining({ id: "voucher 2" }), expect.objectContaining({ id: "voucher 1" })]);
});

test("should return an empty list when the user has no vouchers", async () => {
  mockFindManyVouchers.mockResolvedValue([]);

  const result = await getMyVouchers();

  expect(result).toEqual([]);
});

/* - Testando as falhas - */

test("should return false when looking for the vouchers fails", async () => {
  mockFindManyVouchers.mockRejectedValue(new Error("service error"));

  const result = await getMyVouchers();

  expect(result).toBe(false);
});
