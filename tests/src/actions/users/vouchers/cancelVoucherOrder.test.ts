import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { cancelVoucherOrder } from "@/actions/users/vouchers/cancelVoucherOrder";
import { expireStripeCheckoutSessions, notifyUsersByEmail, refundStripePayment, retryOnFailure } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return {
    prisma,
    expireStripeCheckoutSessions: vi.fn(),
    notifyUsersByEmail: vi.fn(),
    refundStripePayment: vi.fn(),
    retryOnFailure: vi.fn(),
  };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockExpireStripeCheckoutSessions = expireStripeCheckoutSessions as unknown as Mock;
const mockNotifyUsersByEmail = notifyUsersByEmail as unknown as Mock;
const mockRefundStripePayment = refundStripePayment as unknown as Mock;
const mockRetryOnFailure = retryOnFailure as unknown as Mock;
const mockFindUniqueOrder = prisma.voucherOrder.findUnique as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

// O client que a transaction recebe no callback. Cada método é um mock separado para o teste conferir o que foi chamado dentro dela

const mockPaymentUpdateMany = vi.fn();
const mockOrderUpdateMany = vi.fn();
const mockVoucherUpdateMany = vi.fn();
const mockProductUpdate = vi.fn();

const transactionClient = {
  voucherPayment: { updateMany: mockPaymentUpdateMany },
  voucherOrder: { updateMany: mockOrderUpdateMany },
  voucher: { updateMany: mockVoucherUpdateMany },
  product: { update: mockProductUpdate },
};

/* - Funções e dados auxiliares - */

const orderId = "550e8400-e29b-41d4-a716-446655440000";
const paymentCreatedAt = new Date("2026-01-14T10:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildPayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  method: "pix",
  status: "confirmed",
  pickedUpAt: null,
  createdAt: paymentCreatedAt,
  ...overrides,
});

const buildDatabaseOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  userId: "user 1",
  status: "confirmed",
  vouchers: [
    { productId: "product 1", quantity: 2 },
    { productId: "product 2", quantity: 1 },
  ],
  voucherPayments: [buildPayment()],
  ...overrides,
});

const buildPendingOrder = (overrides: Record<string, unknown> = {}) =>
  buildDatabaseOrder({ status: "pending", voucherPayments: [buildPayment({ status: "pending" })], ...overrides });

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder());
  mockExpireStripeCheckoutSessions.mockResolvedValue(true);
  mockRefundStripePayment.mockResolvedValue(true);
  mockRetryOnFailure.mockImplementation(async (operation: () => Promise<unknown>) => operation());
  mockTransaction.mockImplementation(async (callback: (client: typeof transactionClient) => unknown) => callback(transactionClient));
  mockPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherUpdateMany.mockResolvedValue({ count: 2 });
  mockProductUpdate.mockResolvedValue({});
  mockNotifyUsersByEmail.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await cancelVoucherOrder(invalidId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

/* - Testando a consulta do pedido - */

test("should look for the order with its vouchers and payments", async () => {
  await cancelVoucherOrder(orderId);

  expect(mockFindUniqueOrder).toHaveBeenCalledWith({ where: { id: orderId }, include: { vouchers: true, voucherPayments: true } });
});

test.each([
  ["does not exist", null],
  ["belongs to another user", buildDatabaseOrder({ userId: "user 2" })],
  ["is already cancelled", buildDatabaseOrder({ status: "cancelled" })],
  ["has the pickup registered", buildDatabaseOrder({ voucherPayments: [buildPayment({ pickedUpAt: new Date("2026-01-15T17:00:00.000Z") })] })],
])("should return false and skip the stripe and the transaction when the order %s", async (_description, order) => {
  mockFindUniqueOrder.mockResolvedValue(order);

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

/* - Testando os pagamentos pendentes no Stripe - */

test("should expire the open checkout sessions of the pending payments paid on the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());

  await cancelVoucherOrder(orderId);

  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledTimes(1);
  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledWith("payment 1", paymentCreatedAt);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
});

test("should not expire any session for a pending payment in cash or for a confirmed payment", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ voucherPayments: [buildPayment({ status: "pending", method: "cash" }), buildPayment({ id: "payment 2" })] }),
  );

  await cancelVoucherOrder(orderId);

  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
});

test("should return false and skip the refund and the transaction when a checkout session cannot be expired", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockExpireStripeCheckoutSessions.mockResolvedValue(false);

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando o reembolso - */

test("should refund each confirmed payment of the vouchers on the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ voucherPayments: [buildPayment(), buildPayment({ id: "payment 2" })] }));

  await cancelVoucherOrder(orderId);

  expect(mockRefundStripePayment).toHaveBeenCalledTimes(2);
  expect(mockRefundStripePayment).toHaveBeenNthCalledWith(1, { paymentId: "payment 1", type: "drinks" });
  expect(mockRefundStripePayment).toHaveBeenNthCalledWith(2, { paymentId: "payment 2", type: "drinks" });
});

test("should return false and skip the transaction when a refund fails", async () => {
  mockRefundStripePayment.mockResolvedValue(false);

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

test("should expire the sessions before the refund and the refund before the transaction", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ voucherPayments: [buildPayment({ status: "pending" }), buildPayment({ id: "payment 2" })] }),
  );

  await cancelVoucherOrder(orderId);

  expect(mockExpireStripeCheckoutSessions.mock.invocationCallOrder[0]).toBeLessThan(mockRefundStripePayment.mock.invocationCallOrder[0]);
  expect(mockRefundStripePayment.mock.invocationCallOrder[0]).toBeLessThan(mockRetryOnFailure.mock.invocationCallOrder[0]);
});

/* - Testando a transaction - */

test("should refund the confirmed payments, fail the pending ones, cancel the order and its active vouchers inside the transaction", async () => {
  await cancelVoucherOrder(orderId);

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockPaymentUpdateMany).toHaveBeenNthCalledWith(1, { where: { orderId, status: "confirmed" }, data: { status: "refunded" } });
  expect(mockPaymentUpdateMany).toHaveBeenNthCalledWith(2, { where: { orderId, status: "pending" }, data: { status: "failed" } });
  expect(mockOrderUpdateMany).toHaveBeenCalledWith({ where: { id: orderId, status: { not: "cancelled" } }, data: { status: "cancelled" } });
  expect(mockVoucherUpdateMany).toHaveBeenCalledWith({ where: { orderId, status: "active" }, data: { status: "cancelled" } });
});

test("should give back to the stock the quantity reserved for each voucher", async () => {
  await cancelVoucherOrder(orderId);

  expect(mockProductUpdate).toHaveBeenCalledTimes(2);
  expect(mockProductUpdate).toHaveBeenNthCalledWith(1, { where: { id: "product 1" }, data: { quantity: { increment: 2 } } });
  expect(mockProductUpdate).toHaveBeenNthCalledWith(2, { where: { id: "product 2" }, data: { quantity: { increment: 1 } } });
});

test("should update the payments before the order and the order before the vouchers and the stock", async () => {
  await cancelVoucherOrder(orderId);

  expect(mockPaymentUpdateMany.mock.invocationCallOrder[1]).toBeLessThan(mockOrderUpdateMany.mock.invocationCallOrder[0]);
  expect(mockOrderUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(mockVoucherUpdateMany.mock.invocationCallOrder[0]);
  expect(mockVoucherUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(mockProductUpdate.mock.invocationCallOrder[0]);
});

test("should skip the vouchers and never give the stock back twice when the order was already cancelled by another call", async () => {
  mockOrderUpdateMany.mockResolvedValue({ count: 0 });

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(true);
  expect(mockVoucherUpdateMany).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

test("should cancel a pending order paid in cash without calling the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ status: "pending", voucherPayments: [buildPayment({ status: "pending", method: "cash" })] }),
  );

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(true);
  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).toHaveBeenCalledTimes(1);
});

test("should return false and skip the notification when the transaction fails", async () => {
  mockRetryOnFailure.mockRejectedValue(new Error("transaction error"));

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

test("should log that the refund was made when the transaction fails after a refund", async () => {
  const error = new Error("transaction error");

  mockRetryOnFailure.mockRejectedValue(error);

  await cancelVoucherOrder(orderId);

  expect(console.error).toHaveBeenCalledWith(expect.stringContaining(orderId), error);
});

test("should not log anything when the transaction fails and there was no refund", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockRetryOnFailure.mockRejectedValue(new Error("transaction error"));

  await cancelVoucherOrder(orderId);

  expect(console.error).not.toHaveBeenCalled();
});

/* - Testando a notificação - */

test("should notify the user with the order code after the order is cancelled", async () => {
  await cancelVoucherOrder(orderId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], {
    type: "order_cancelled",
    title: "Pedido cancelado",
    message: "O seu pedido de vouchers #550E8400 foi cancelado.",
  });
  expect(mockRetryOnFailure.mock.invocationCallOrder[0]).toBeLessThan(mockNotifyUsersByEmail.mock.invocationCallOrder[0]);
});

test("should return true when notifying the user fails", async () => {
  mockNotifyUsersByEmail.mockRejectedValue(new Error("service error"));

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(true);
  expect(console.error).toHaveBeenCalledTimes(1);
});

/* - Testando o resultado - */

test("should return true when the order is cancelled", async () => {
  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(true);
});

/* - Testando as falhas - */

test.each([
  ["looking for the order", () => mockFindUniqueOrder],
  ["refunding the payment", () => mockRefundStripePayment],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

test("should return false when expiring the checkout sessions fails", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockExpireStripeCheckoutSessions.mockRejectedValue(new Error("service error"));

  const result = await cancelVoucherOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});
