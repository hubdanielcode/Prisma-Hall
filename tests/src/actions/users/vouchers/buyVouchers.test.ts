import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { buyVouchers } from "@/actions/users/vouchers/buyVouchers";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

// O client que a transaction recebe no callback. Cada método é um mock separado para o teste conferir o que foi chamado dentro dela

const mockProductFindMany = vi.fn();
const mockProductUpdateMany = vi.fn();
const mockVoucherOrderCreate = vi.fn();

const transactionClient = {
  product: { findMany: mockProductFindMany, updateMany: mockProductUpdateMany },
  voucherOrder: { create: mockVoucherOrderCreate },
};

/* - Funções e dados auxiliares - */

type BuyVouchersInput = Parameters<typeof buyVouchers>[0];

const productId = "550e8400-e29b-41d4-a716-446655440000";
const otherProductId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const createdAt = new Date("2026-01-15T18:00:00.000Z");
const updatedAt = new Date("2026-01-16T09:30:00.000Z");

const buildInput = (overrides: Record<string, unknown> = {}) =>
  ({ items: [{ productId, quantity: 2 }], method: "pix", ...overrides }) as unknown as BuyVouchersInput;

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price do Prisma é um Decimal, por isso os mocks têm o método toNumber (o mesmo objeto é reaproveitado para comparar o unitPrice enviado ao banco)

const productPrice = { toNumber: () => 12.5 };
const otherProductPrice = { toNumber: () => 8 };

const buildDatabaseProduct = (overrides: Record<string, unknown> = {}) => ({
  id: productId,
  status: "active",
  quantity: 10,
  price: productPrice,
  ...overrides,
});
const buildOtherDatabaseProduct = () => buildDatabaseProduct({ id: otherProductId, price: otherProductPrice });

// O totalValue do pagamento sai da action do jeito que veio do banco (Decimal), sem toNumber

const paymentTotalValue = { toNumber: () => 25 };

const buildDatabaseOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "order 1",
  status: "pending",
  vouchers: [{ id: "voucher 1", productId, quantity: 2 }],
  voucherPayments: [{ method: "pix", status: "pending", totalValue: paymentTotalValue }],
  createdAt,
  updatedAt,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockTransaction.mockImplementation(async (callback: (client: typeof transactionClient) => unknown) => callback(transactionClient));
  mockProductFindMany.mockResolvedValue([buildDatabaseProduct()]);
  mockProductUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherOrderCreate.mockResolvedValue(buildDatabaseOrder());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the transaction when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await buyVouchers(buildInput());

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
});

test.each([
  ["no items", { items: [] }],
  ["a product id that is not a uuid", { items: [{ productId: "not-a-uuid", quantity: 1 }] }],
  ["a quantity of zero", { items: [{ productId, quantity: 0 }] }],
  ["a quantity that is not an integer", { items: [{ productId, quantity: 1.5 }] }],
  ["a payment method that does not exist", { method: "boleto" }],
])("should return false and skip the transaction when the input has %s", async (_description, invalidInput) => {
  const result = await buyVouchers(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando a consulta dos produtos - */

test("should look only for the active products of the order inside the transaction", async () => {
  await buyVouchers(buildInput());

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockProductFindMany).toHaveBeenCalledWith({ where: { id: { in: [productId] }, status: "active" } });
});

test.each([
  ["a product that is not active or does not exist", [buildDatabaseProduct()]],
  ["every product missing", []],
])("should return false and skip the stock and the order when there is %s", async (_description, products) => {
  mockProductFindMany.mockResolvedValue(products);

  const result = await buyVouchers(
    buildInput({
      items: [
        { productId, quantity: 1 },
        { productId: otherProductId, quantity: 1 },
      ],
    }),
  );

  expect(result).toBe(false);
  expect(mockProductUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
});

/* - Testando o estoque - */

test("should reserve the quantity of the product in the stock only when there is enough of it", async () => {
  await buyVouchers(buildInput());

  expect(mockProductUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockProductUpdateMany).toHaveBeenCalledWith({
    where: { id: productId, quantity: { gte: 2 } },
    data: { quantity: { decrement: 2 } },
  });
});

test("should return false and skip the order when the stock is not enough", async () => {
  mockProductUpdateMany.mockResolvedValue({ count: 0 });

  const result = await buyVouchers(buildInput());

  expect(result).toBe(false);
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
});

test("should sum the quantities of the same product that came in more than one item", async () => {
  await buyVouchers(
    buildInput({
      items: [
        { productId, quantity: 1 },
        { productId, quantity: 2 },
      ],
    }),
  );

  expect(mockProductFindMany).toHaveBeenCalledWith({ where: { id: { in: [productId] }, status: "active" } });
  expect(mockProductUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockProductUpdateMany).toHaveBeenCalledWith({ where: { id: productId, quantity: { gte: 3 } }, data: { quantity: { decrement: 3 } } });
  expect(mockVoucherOrderCreate.mock.calls[0][0].data.vouchers.create).toEqual([
    { userId: "user 1", productId, quantity: 3, unitPrice: productPrice },
  ]);
});

/* - Testando a criação do pedido - */

test("should create the order, the voucher and the pending payment at once for the logged user", async () => {
  await buyVouchers(buildInput());

  expect(mockVoucherOrderCreate).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderCreate).toHaveBeenCalledWith({
    data: {
      userId: "user 1",
      status: "pending",
      vouchers: { create: [{ userId: "user 1", productId, quantity: 2, unitPrice: productPrice }] },
      voucherPayments: { create: { userId: "user 1", method: "pix", status: "pending", totalValue: 25 } },
    },
    include: { vouchers: true, voucherPayments: true },
  });
});

test("should create one voucher for each product and charge the sum of all of them", async () => {
  mockProductFindMany.mockResolvedValue([buildDatabaseProduct(), buildOtherDatabaseProduct()]);

  await buyVouchers(
    buildInput({
      items: [
        { productId, quantity: 2 },
        { productId: otherProductId, quantity: 3 },
      ],
    }),
  );

  const orderData = mockVoucherOrderCreate.mock.calls[0][0].data;

  expect(mockProductUpdateMany).toHaveBeenCalledTimes(2);
  expect(orderData.vouchers.create).toEqual([
    { userId: "user 1", productId, quantity: 2, unitPrice: productPrice },
    { userId: "user 1", productId: otherProductId, quantity: 3, unitPrice: otherProductPrice },
  ]);
  expect(orderData.voucherPayments.create.totalValue).toBe(49);
});

test("should charge the price of the product read from the database and not a value from the input", async () => {
  await buyVouchers(buildInput({ items: [{ productId, quantity: 2, price: 1 }], totalValue: 1 }));

  const orderData = mockVoucherOrderCreate.mock.calls[0][0].data;

  expect(orderData.vouchers.create[0].unitPrice).toBe(productPrice);
  expect(orderData.voucherPayments.create.totalValue).toBe(25);
});

test.each([["cash"], ["pix"], ["debitCard"], ["creditCard"]])("should save the %s method in the payment", async (method) => {
  await buyVouchers(buildInput({ method }));

  expect(mockVoucherOrderCreate.mock.calls[0][0].data.voucherPayments.create.method).toBe(method);
});

/* - Testando o resultado - */

test("should return the order with the vouchers and the dates as ISO strings", async () => {
  const result = await buyVouchers(buildInput());

  expect(result).toEqual({
    id: "order 1",
    status: "pending",
    method: "pix",
    paymentStatus: "pending",
    totalValue: paymentTotalValue,
    vouchers: [{ id: "voucher 1", productId, quantity: 2 }],
    createdAt: "2026-01-15T18:00:00.000Z",
    updatedAt: "2026-01-16T09:30:00.000Z",
  });
});

/* - Testando as falhas - */

test.each([
  ["running the transaction", () => mockTransaction],
  ["looking for the products", () => mockProductFindMany],
  ["reserving the stock", () => mockProductUpdateMany],
  ["creating the order", () => mockVoucherOrderCreate],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await buyVouchers(buildInput());

  expect(result).toBe(false);
});
