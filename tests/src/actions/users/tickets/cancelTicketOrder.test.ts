import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { cancelTicketOrder } from "@/actions/users/tickets/cancelTicketOrder";
import { expireStripeCheckoutSessions, notifyUsersByEmail, recalculateUserBadges, refundStripePayment, retryOnFailure } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o isTicketCancellationOpen continua o real) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return {
    prisma,
    expireStripeCheckoutSessions: vi.fn(),
    notifyUsersByEmail: vi.fn(),
    recalculateUserBadges: vi.fn(),
    refundStripePayment: vi.fn(),
    retryOnFailure: vi.fn(),
  };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockExpireStripeCheckoutSessions = expireStripeCheckoutSessions as unknown as Mock;
const mockNotifyUsersByEmail = notifyUsersByEmail as unknown as Mock;
const mockRecalculateUserBadges = recalculateUserBadges as unknown as Mock;
const mockRefundStripePayment = refundStripePayment as unknown as Mock;
const mockRetryOnFailure = retryOnFailure as unknown as Mock;
const mockFindUniqueOrder = prisma.ticketOrder.findUnique as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

// O client que a transaction recebe no callback. Cada método é um mock separado para o teste conferir o que foi chamado dentro dela

const mockPaymentUpdateMany = vi.fn();
const mockOrderUpdateMany = vi.fn();
const mockTicketUpdateMany = vi.fn();

const transactionClient = {
  ticketPayment: { updateMany: mockPaymentUpdateMany },
  ticketOrder: { updateMany: mockOrderUpdateMany },
  ticket: { updateMany: mockTicketUpdateMany },
};

/* - Funções e dados auxiliares - */

const orderId = "550e8400-e29b-41d4-a716-446655440000";
const eventTitle = "Rock na Praça";
const now = new Date("2026-01-15T18:00:00.000Z");
const farStartsAt = new Date("2026-02-15T18:00:00.000Z");
const insideDeadlineStartsAt = new Date("2026-01-16T12:00:00.000Z");
const pastStartsAt = new Date("2026-01-10T18:00:00.000Z");
const paymentCreatedAt = new Date("2026-01-14T10:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildTicket = (eventOverrides: Record<string, unknown> = {}) => ({
  id: "ticket 1",
  event: { title: eventTitle, isCancelled: false, startsAt: farStartsAt, ...eventOverrides },
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
  tickets: [buildTicket()],
  ticketPayments: [buildPayment()],
  ...overrides,
});

const buildPendingOrder = (overrides: Record<string, unknown> = {}) =>
  buildDatabaseOrder({ status: "pending", ticketPayments: [buildPayment({ status: "pending" })], ...overrides });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder());
  mockExpireStripeCheckoutSessions.mockResolvedValue(true);
  mockRefundStripePayment.mockResolvedValue(true);
  mockRetryOnFailure.mockImplementation(async (operation: () => Promise<unknown>) => operation());
  mockTransaction.mockImplementation(async (callback: (client: typeof transactionClient) => unknown) => callback(transactionClient));
  mockPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockTicketUpdateMany.mockResolvedValue({ count: 1 });
  mockRecalculateUserBadges.mockResolvedValue(undefined);
  mockNotifyUsersByEmail.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await cancelTicketOrder(invalidId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

/* - Testando a consulta do pedido - */

test("should look for the order with its tickets, events and payments", async () => {
  await cancelTicketOrder(orderId);

  expect(mockFindUniqueOrder).toHaveBeenCalledWith({
    where: { id: orderId },
    include: { tickets: { include: { event: true } }, ticketPayments: true },
  });
});

test.each([
  ["does not exist", null],
  ["belongs to another user", buildDatabaseOrder({ userId: "user 2" })],
  ["is already cancelled", buildDatabaseOrder({ status: "cancelled" })],
])("should return false and skip the stripe and the transaction when the order %s", async (_description, order) => {
  mockFindUniqueOrder.mockResolvedValue(order);

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

/* - Testando o prazo de cancelamento e a retirada - */

test.each([
  ["the event already happened", [buildTicket({ startsAt: pastStartsAt })]],
  ["the event starts in less than 24 hours", [buildTicket({ startsAt: insideDeadlineStartsAt })]],
  ["one of the events is out of the deadline", [buildTicket(), buildTicket({ startsAt: insideDeadlineStartsAt })]],
])("should return false and skip the stripe and the transaction when %s", async (_description, tickets) => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ tickets }));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

test("should cancel the order when the event is cancelled, even after the deadline", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ tickets: [buildTicket({ isCancelled: true, startsAt: pastStartsAt })] }));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
  expect(mockRetryOnFailure).toHaveBeenCalledTimes(1);
});

test("should return false and skip the stripe and the transaction when the pickup was already registered", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ ticketPayments: [buildPayment({ pickedUpAt: new Date("2026-01-15T17:00:00.000Z") })] }));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

/* - Testando os pagamentos pendentes no Stripe - */

test("should expire the open checkout sessions of the pending payments paid on the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());

  await cancelTicketOrder(orderId);

  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledTimes(1);
  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledWith("payment 1", paymentCreatedAt);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
});

test("should not expire any session for a pending payment in cash or for a confirmed payment", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ ticketPayments: [buildPayment({ status: "pending", method: "cash" }), buildPayment({ id: "payment 2" })] }),
  );

  await cancelTicketOrder(orderId);

  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
});

test("should return false and skip the refund and the transaction when a checkout session cannot be expired", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockExpireStripeCheckoutSessions.mockResolvedValue(false);

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando o reembolso - */

test("should refund each confirmed payment of the tickets on the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ ticketPayments: [buildPayment(), buildPayment({ id: "payment 2" })] }));

  await cancelTicketOrder(orderId);

  expect(mockRefundStripePayment).toHaveBeenCalledTimes(2);
  expect(mockRefundStripePayment).toHaveBeenNthCalledWith(1, { paymentId: "payment 1", type: "tickets" });
  expect(mockRefundStripePayment).toHaveBeenNthCalledWith(2, { paymentId: "payment 2", type: "tickets" });
});

test("should return false and skip the transaction when a refund fails", async () => {
  mockRefundStripePayment.mockResolvedValue(false);

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

test("should expire the sessions before the refund and the refund before the transaction", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ ticketPayments: [buildPayment({ status: "pending" }), buildPayment({ id: "payment 2" })] }),
  );

  await cancelTicketOrder(orderId);

  expect(mockExpireStripeCheckoutSessions.mock.invocationCallOrder[0]).toBeLessThan(mockRefundStripePayment.mock.invocationCallOrder[0]);
  expect(mockRefundStripePayment.mock.invocationCallOrder[0]).toBeLessThan(mockRetryOnFailure.mock.invocationCallOrder[0]);
});

/* - Testando a transaction - */

test("should refund the confirmed payments, cancel the pending ones, the order and its active tickets inside the transaction", async () => {
  await cancelTicketOrder(orderId);

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockPaymentUpdateMany).toHaveBeenNthCalledWith(1, { where: { orderId, status: "confirmed" }, data: { status: "refunded" } });
  expect(mockPaymentUpdateMany).toHaveBeenNthCalledWith(2, { where: { orderId, status: "pending" }, data: { status: "cancelled" } });
  expect(mockOrderUpdateMany).toHaveBeenCalledWith({ where: { id: orderId, status: { not: "cancelled" } }, data: { status: "cancelled" } });
  expect(mockTicketUpdateMany).toHaveBeenCalledWith({ where: { orderId, status: "active" }, data: { status: "cancelled" } });
});

test("should update the payments before the order and the order before the tickets", async () => {
  await cancelTicketOrder(orderId);

  expect(mockPaymentUpdateMany.mock.invocationCallOrder[1]).toBeLessThan(mockOrderUpdateMany.mock.invocationCallOrder[0]);
  expect(mockOrderUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(mockTicketUpdateMany.mock.invocationCallOrder[0]);
});

test("should skip the tickets and still return true when the order was already cancelled by another call", async () => {
  mockOrderUpdateMany.mockResolvedValue({ count: 0 });

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

test("should cancel a pending order paid in cash without calling the stripe", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ status: "pending", ticketPayments: [buildPayment({ status: "pending", method: "cash" })] }),
  );

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockRetryOnFailure).toHaveBeenCalledTimes(1);
});

test("should return false and skip the consequences when the transaction fails", async () => {
  mockRetryOnFailure.mockRejectedValue(new Error("transaction error"));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

test("should log that the refund was made when the transaction fails after a refund", async () => {
  const error = new Error("transaction error");

  mockRetryOnFailure.mockRejectedValue(error);

  await cancelTicketOrder(orderId);

  expect(console.error).toHaveBeenCalledWith(expect.stringContaining(orderId), error);
});

test("should not log anything when the transaction fails and there was no refund", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockRetryOnFailure.mockRejectedValue(new Error("transaction error"));

  await cancelTicketOrder(orderId);

  expect(console.error).not.toHaveBeenCalled();
});

/* - Testando as consequências do cancelamento - */

test("should recalculate the badges of the user after the order is cancelled", async () => {
  await cancelTicketOrder(orderId);

  expect(mockRecalculateUserBadges).toHaveBeenCalledWith("user 1");
  expect(mockRetryOnFailure.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateUserBadges.mock.invocationCallOrder[0]);
});

test("should notify the user with the order code and the title of the event", async () => {
  await cancelTicketOrder(orderId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], {
    type: "order_cancelled",
    title: "Pedido cancelado",
    message: `O seu pedido #550E8400 (${eventTitle}) foi cancelado.`,
  });
});

test("should notify the user without the title of the event when the order has no tickets", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ tickets: [] }));

  await cancelTicketOrder(orderId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], expect.objectContaining({ message: "O seu pedido #550E8400 foi cancelado." }));
});

test("should still notify the user and return true when recalculating the badges fails", async () => {
  mockRecalculateUserBadges.mockRejectedValue(new Error("service error"));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
});

test("should return true when notifying the user fails", async () => {
  mockNotifyUsersByEmail.mockRejectedValue(new Error("service error"));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
  expect(console.error).toHaveBeenCalledTimes(1);
});

/* - Testando o resultado - */

test("should return true when the order is cancelled", async () => {
  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(true);
});

/* - Testando as falhas - */

test.each([
  ["looking for the order", () => mockFindUniqueOrder],
  ["refunding the payment", () => mockRefundStripePayment],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});

test("should return false when expiring the checkout sessions fails", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildPendingOrder());
  mockExpireStripeCheckoutSessions.mockRejectedValue(new Error("service error"));

  const result = await cancelTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockRetryOnFailure).not.toHaveBeenCalled();
});
