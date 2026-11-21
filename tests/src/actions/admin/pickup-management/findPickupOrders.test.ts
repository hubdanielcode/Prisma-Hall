import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { findPickupOrders } from "@/actions/admin/pickup-management/findPickupOrders";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { getPickupBlockReason } from "@/lib/server/orders/getPickupBlockReason";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

vi.mock("@/lib/server/orders/getPickupBlockReason", () => ({ getPickupBlockReason: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockGetPickupBlockReason = getPickupBlockReason as unknown as Mock;
const mockFindManyTicketOrders = prisma.ticketOrder.findMany as unknown as Mock;
const mockFindManyVoucherOrders = prisma.voucherOrder.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type FindPickupOrdersInput = Parameters<typeof findPickupOrders>[0];

const orderId = "550e8400-e29b-41d4-a716-446655440000";

const buildInput = (overrides: Partial<FindPickupOrdersInput> = {}): FindPickupOrdersInput => ({
  query: "maria",
  type: "tickets",
  ...overrides,
});

// O totalValue do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDbPayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  method: "pix",
  status: "confirmed",
  totalValue: { toNumber: () => 150.5 },
  confirmedAt: new Date("2026-01-10T12:00:00.000Z"),
  pickedUpAt: null,
  ...overrides,
});

const buildExpectedPayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  method: "pix",
  status: "confirmed",
  totalValue: 150.5,
  confirmedAt: "2026-01-10T12:00:00.000Z",
  pickedUpAt: null,
  ...overrides,
});

const buildDbTicketOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  status: "confirmed",
  user: { name: "Maria Silva", email: "maria@email.com" },
  tickets: [{ id: "ticket 1", quantity: 2, event: { title: "Rock in Rio" } }],
  ticketPayments: [buildDbPayment()],
  createdAt: new Date("2026-01-09T12:00:00.000Z"),
  ...overrides,
});

const buildDbVoucherOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  status: "confirmed",
  user: { name: "Maria Silva", email: "maria@email.com" },
  vouchers: [{ id: "voucher 1", quantity: 3, product: { name: "Heineken" } }],
  voucherPayments: [buildDbPayment()],
  createdAt: new Date("2026-01-09T12:00:00.000Z"),
  ...overrides,
});

const buildExpectedTicketOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  type: "tickets",
  status: "confirmed",
  user: { name: "Maria Silva", email: "maria@email.com" },
  items: [{ id: "ticket 1", name: "Rock in Rio", quantity: 2 }],
  payment: buildExpectedPayment(),
  blockReason: null,
  createdAt: "2026-01-09T12:00:00.000Z",
  ...overrides,
});

const buildExpectedVoucherOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  type: "vouchers",
  status: "confirmed",
  user: { name: "Maria Silva", email: "maria@email.com" },
  items: [{ id: "voucher 1", name: "Heineken", quantity: 3 }],
  payment: buildExpectedPayment(),
  blockReason: null,
  createdAt: "2026-01-09T12:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockGetPickupBlockReason.mockReturnValue(null);
  mockFindManyTicketOrders.mockResolvedValue([]);
  mockFindManyVoucherOrders.mockResolvedValue([]);
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await findPickupOrders(buildInput());

  expect(result).toBe(false);
  expect(mockFindManyTicketOrders).not.toHaveBeenCalled();
  expect(mockFindManyVoucherOrders).not.toHaveBeenCalled();
});

test.each([
  ["an empty query", { query: "" }],
  ["a query with only spaces", { query: "   " }],
  ["a query under 3 characters", { query: "ma" }],
  ["a query over 100 characters", { query: "a".repeat(101) }],
  ["an unknown type", { type: "invalid" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await findPickupOrders(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindManyTicketOrders).not.toHaveBeenCalled();
  expect(mockFindManyVoucherOrders).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should look for the orders by code, name or e-mail using the trimmed query", async () => {
  await findPickupOrders(buildInput({ query: "  maria  " }));

  expect(mockFindManyTicketOrders).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        OR: [
          { id: { startsWith: "maria", mode: "insensitive" } },
          { user: { name: { contains: "maria", mode: "insensitive" } } },
          { user: { email: { contains: "maria", mode: "insensitive" } } },
        ],
      },
    }),
  );
});

test("should look for the ticket orders with the user, the tickets and the payments, limited to the 10 most recent", async () => {
  await findPickupOrders(buildInput());

  expect(mockFindManyTicketOrders).toHaveBeenCalledWith({
    where: expect.any(Object),
    include: {
      user: { select: { name: true, email: true } },
      tickets: { include: { event: { select: { title: true } } } },
      ticketPayments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  expect(mockFindManyVoucherOrders).not.toHaveBeenCalled();
});

test("should look for the voucher orders with the user, the vouchers and the payments, limited to the 10 most recent", async () => {
  await findPickupOrders(buildInput({ type: "vouchers" }));

  expect(mockFindManyVoucherOrders).toHaveBeenCalledWith({
    where: expect.any(Object),
    include: {
      user: { select: { name: true, email: true } },
      vouchers: { include: { product: { select: { name: true } } } },
      voucherPayments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  expect(mockFindManyTicketOrders).not.toHaveBeenCalled();
});

/* - Testando o resultado dos pedidos de ingresso - */

test("should return an empty list when no ticket order is found", async () => {
  const result = await findPickupOrders(buildInput());

  expect(result).toEqual([]);
});

test("should return the ticket orders with the price as a number and the dates as strings", async () => {
  mockFindManyTicketOrders.mockResolvedValue([buildDbTicketOrder()]);

  const result = await findPickupOrders(buildInput());

  expect(result).toEqual([buildExpectedTicketOrder()]);
});

test("should return the orders in the same order they came from the database", async () => {
  mockFindManyTicketOrders.mockResolvedValue([buildDbTicketOrder({ id: "order 2" }), buildDbTicketOrder({ id: "order 1" })]);

  const result = await findPickupOrders(buildInput());

  expect(result).toEqual([expect.objectContaining({ id: "order 2" }), expect.objectContaining({ id: "order 1" })]);
});

test("should return one item for each ticket of the order", async () => {
  mockFindManyTicketOrders.mockResolvedValue([
    buildDbTicketOrder({
      tickets: [
        { id: "ticket 1", quantity: 2, event: { title: "Rock in Rio" } },
        { id: "ticket 2", quantity: 1, event: { title: "Lollapalooza" } },
      ],
    }),
  ]);

  const result = await findPickupOrders(buildInput());

  expect(result).toEqual([
    expect.objectContaining({
      items: [
        { id: "ticket 1", name: "Rock in Rio", quantity: 2 },
        { id: "ticket 2", name: "Lollapalooza", quantity: 1 },
      ],
    }),
  ]);
});

/* - Testando o resultado dos pedidos de voucher - */

test("should return an empty list when no voucher order is found", async () => {
  const result = await findPickupOrders(buildInput({ type: "vouchers" }));

  expect(result).toEqual([]);
});

test("should return the voucher orders with the price as a number and the dates as strings", async () => {
  mockFindManyVoucherOrders.mockResolvedValue([buildDbVoucherOrder()]);

  const result = await findPickupOrders(buildInput({ type: "vouchers" }));

  expect(result).toEqual([buildExpectedVoucherOrder()]);
});

test("should return one item for each voucher of the order", async () => {
  mockFindManyVoucherOrders.mockResolvedValue([
    buildDbVoucherOrder({
      vouchers: [
        { id: "voucher 1", quantity: 3, product: { name: "Heineken" } },
        { id: "voucher 2", quantity: 1, product: { name: "Coca-Cola" } },
      ],
    }),
  ]);

  const result = await findPickupOrders(buildInput({ type: "vouchers" }));

  expect(result).toEqual([
    expect.objectContaining({
      items: [
        { id: "voucher 1", name: "Heineken", quantity: 3 },
        { id: "voucher 2", name: "Coca-Cola", quantity: 1 },
      ],
    }),
  ]);
});

/* - Testando a escolha do pagamento principal - */

test.each([
  ["tickets", "ticketPayments", buildDbTicketOrder, mockFindManyTicketOrders],
  ["vouchers", "voucherPayments", buildDbVoucherOrder, mockFindManyVoucherOrders],
] as const)(
  "should use the confirmed payment as the main one even when it is not the most recent for %s",
  async (type, paymentsField, buildOrder, mockFindMany) => {
    mockFindMany.mockResolvedValue([
      buildOrder({
        [paymentsField]: [
          buildDbPayment({ id: "pending payment", status: "pending", confirmedAt: null }),
          buildDbPayment({ id: "confirmed payment" }),
        ],
      }),
    ]);

    const result = await findPickupOrders(buildInput({ type }));

    expect(result).toEqual([expect.objectContaining({ payment: buildExpectedPayment({ id: "confirmed payment" }) })]);
  },
);

test.each([
  ["tickets", "ticketPayments", buildDbTicketOrder, mockFindManyTicketOrders],
  ["vouchers", "voucherPayments", buildDbVoucherOrder, mockFindManyVoucherOrders],
] as const)(
  "should use the most recent payment as the main one when none is confirmed for %s",
  async (type, paymentsField, buildOrder, mockFindMany) => {
    mockFindMany.mockResolvedValue([
      buildOrder({
        [paymentsField]: [
          buildDbPayment({ id: "recent payment", status: "failed", confirmedAt: null }),
          buildDbPayment({ id: "old payment", status: "pending", confirmedAt: null }),
        ],
      }),
    ]);

    const result = await findPickupOrders(buildInput({ type }));

    expect(result).toEqual([
      expect.objectContaining({ payment: buildExpectedPayment({ id: "recent payment", status: "failed", confirmedAt: null }) }),
    ]);
  },
);

test.each([
  ["tickets", "ticketPayments", buildDbTicketOrder, mockFindManyTicketOrders],
  ["vouchers", "voucherPayments", buildDbVoucherOrder, mockFindManyVoucherOrders],
] as const)("should return a null payment when the order has no payments for %s", async (type, paymentsField, buildOrder, mockFindMany) => {
  mockFindMany.mockResolvedValue([buildOrder({ [paymentsField]: [] })]);

  const result = await findPickupOrders(buildInput({ type }));

  expect(result).toEqual([expect.objectContaining({ payment: null })]);
});

test.each([
  ["confirmedAt", { confirmedAt: null }, { confirmedAt: null }],
  ["pickedUpAt", { pickedUpAt: new Date("2026-01-12T15:30:00.000Z") }, { pickedUpAt: "2026-01-12T15:30:00.000Z" }],
])("should convert the %s of the payment into a string only when it has a date", async (_field, dbOverrides, expectedOverrides) => {
  mockFindManyTicketOrders.mockResolvedValue([buildDbTicketOrder({ ticketPayments: [buildDbPayment(dbOverrides)] })]);

  const result = await findPickupOrders(buildInput());

  expect(result).toEqual([expect.objectContaining({ payment: buildExpectedPayment(expectedOverrides) })]);
});

/* - Testando o motivo do bloqueio - */

test("should get the block reason from the order status and the ticket payments", async () => {
  const ticketPayments = [buildDbPayment()];

  mockFindManyTicketOrders.mockResolvedValue([buildDbTicketOrder({ status: "pending", ticketPayments })]);

  await findPickupOrders(buildInput());

  expect(mockGetPickupBlockReason).toHaveBeenCalledWith("pending", ticketPayments);
});

test("should get the block reason from the order status and the voucher payments", async () => {
  const voucherPayments = [buildDbPayment()];

  mockFindManyVoucherOrders.mockResolvedValue([buildDbVoucherOrder({ status: "cancelled", voucherPayments })]);

  await findPickupOrders(buildInput({ type: "vouchers" }));

  expect(mockGetPickupBlockReason).toHaveBeenCalledWith("cancelled", voucherPayments);
});

test.each([
  ["tickets", mockFindManyTicketOrders, buildDbTicketOrder],
  ["vouchers", mockFindManyVoucherOrders, buildDbVoucherOrder],
] as const)("should return the block reason given by the pickup rule for %s", async (type, mockFindMany, buildOrder) => {
  mockGetPickupBlockReason.mockReturnValue("already_picked_up");
  mockFindMany.mockResolvedValue([buildOrder()]);

  const result = await findPickupOrders(buildInput({ type }));

  expect(result).toEqual([expect.objectContaining({ blockReason: "already_picked_up" })]);
});

test("should call the pickup rule once for each order", async () => {
  mockFindManyTicketOrders.mockResolvedValue([buildDbTicketOrder({ id: "order 1" }), buildDbTicketOrder({ id: "order 2" })]);

  await findPickupOrders(buildInput());

  expect(mockGetPickupBlockReason).toHaveBeenCalledTimes(2);
});

/* - Testando as falhas do banco - */

test.each([
  ["tickets", () => mockFindManyTicketOrders],
  ["vouchers", () => mockFindManyVoucherOrders],
])("should return false when fetching the %s orders fails", async (type, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await findPickupOrders(buildInput({ type: type as FindPickupOrdersInput["type"] }));

  expect(result).toBe(false);
});
