import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getVoucherOrder } from "@/actions/users/vouchers/getVoucherOrder";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUniqueOrder = prisma.voucherOrder.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const orderId = "550e8400-e29b-41d4-a716-446655440000";

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O unitPrice e o totalValue do Prisma são Decimal, por isso os mocks têm o método toNumber (o price do produto é diferente de propósito, para provar que o preço do voucher é o gravado na compra)

const buildDatabaseVoucher = (overrides: Record<string, unknown> = {}) => ({
  id: "voucher 1",
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

  ...overrides,
});

const buildDatabasePayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  method: "pix",
  status: "confirmed",
  totalValue: { toNumber: () => 20 },
  pickedUpAt: null,
  createdAt: new Date("2026-01-15T18:00:00.000Z"),
  ...overrides,
});

const buildDatabaseOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  userId: "user 1",
  status: "confirmed",
  vouchers: [buildDatabaseVoucher()],
  voucherPayments: [buildDatabasePayment()],
  createdAt: new Date("2026-01-15T18:00:00.000Z"),
  updatedAt: new Date("2026-01-16T09:30:00.000Z"),
  ...overrides,
});

const expectedOrder = {
  id: orderId,
  status: "confirmed",

  vouchers: [
    {
      id: "voucher 1",
      productId: "product 1",
      quantity: 2,

      product: {
        id: "product 1",
        name: "Heineken",
        category: "beers",
        description: "Cerveja long neck 330ml",
        image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
        price: 10,
      },
    },
  ],

  payments: [
    {
      id: "payment 1",
      method: "pix",
      status: "confirmed",
      totalValue: 20,
      pickedUpAt: null,
      createdAt: "2026-01-15T18:00:00.000Z",
    },
  ],

  createdAt: "2026-01-15T18:00:00.000Z",
  updatedAt: "2026-01-16T09:30:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await getVoucherOrder(invalidId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the order with its vouchers, products and payments, from the newest payment to the oldest", async () => {
  await getVoucherOrder(orderId);

  expect(mockFindUniqueOrder).toHaveBeenCalledWith({
    where: { id: orderId },
    include: {
      vouchers: { include: { product: true } },
      voucherPayments: { orderBy: { createdAt: "desc" } },
    },
  });
});

test.each([
  ["does not exist", null],
  ["belongs to another user", buildDatabaseOrder({ userId: "user 2" })],
])("should return false when the order %s", async (_description, order) => {
  mockFindUniqueOrder.mockResolvedValue(order);

  const result = await getVoucherOrder(orderId);

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the order with the values as numbers and the dates as ISO strings", async () => {
  const result = await getVoucherOrder(orderId);

  expect(result).toEqual(expectedOrder);
});

test("should return the price saved in the voucher and not the current price of the product", async () => {
  const result = await getVoucherOrder(orderId);

  expect(result).toEqual(expect.objectContaining({ vouchers: [expect.objectContaining({ product: expect.objectContaining({ price: 10 }) })] }));
});

test("should return the pickup date as an ISO string when the pickup was registered", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ voucherPayments: [buildDatabasePayment({ pickedUpAt: new Date("2026-01-17T12:00:00.000Z") })] }),
  );

  const result = await getVoucherOrder(orderId);

  expect(result).toEqual(expect.objectContaining({ payments: [expect.objectContaining({ pickedUpAt: "2026-01-17T12:00:00.000Z" })] }));
});

test("should return every voucher and payment in the order that came from the database", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({
      vouchers: [buildDatabaseVoucher({ id: "voucher 2" }), buildDatabaseVoucher()],
      voucherPayments: [buildDatabasePayment({ id: "payment 2" }), buildDatabasePayment()],
    }),
  );

  const result = await getVoucherOrder(orderId);

  expect(result).toEqual(
    expect.objectContaining({
      vouchers: [expect.objectContaining({ id: "voucher 2" }), expect.objectContaining({ id: "voucher 1" })],
      payments: [expect.objectContaining({ id: "payment 2" }), expect.objectContaining({ id: "payment 1" })],
    }),
  );
});

/* - Testando as falhas - */

test("should return false when looking for the order fails", async () => {
  mockFindUniqueOrder.mockRejectedValue(new Error("service error"));

  const result = await getVoucherOrder(orderId);

  expect(result).toBe(false);
});
