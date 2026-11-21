import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { cancelEvent } from "@/actions/admin/events-management/event-management/cancelEvent";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { getUserIdsThatFavoritedEvent, notifyUsersByEmail, refundStripePayment } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup; o getEventStatus e o serviceFee continuam os reais) - */

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return {
    prisma,
    getEventStatus,
    getUserIdsThatFavoritedEvent: vi.fn(),
    notifyUsersByEmail: vi.fn(),
    refundStripePayment: vi.fn(),
  };
});

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockGetUserIdsThatFavoritedEvent = getUserIdsThatFavoritedEvent as unknown as Mock;
const mockNotifyUsersByEmail = notifyUsersByEmail as unknown as Mock;
const mockRefundStripePayment = refundStripePayment as unknown as Mock;
const mockEventFindUnique = prisma.event.findUnique as unknown as Mock;
const mockEventUpdate = prisma.event.update as unknown as Mock;
const mockOrderFindMany = prisma.ticketOrder.findMany as unknown as Mock;
const mockOrderUpdate = prisma.ticketOrder.update as unknown as Mock;
const mockOrderUpdateMany = prisma.ticketOrder.updateMany as unknown as Mock;
const mockPaymentUpdate = prisma.ticketPayment.update as unknown as Mock;
const mockPaymentUpdateMany = prisma.ticketPayment.updateMany as unknown as Mock;
const mockTicketUpdateMany = prisma.ticket.updateMany as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

/* - Funções e dados auxiliares - */

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const eventTitle = "Rock na Praça";
const otherEventId = "660e8400-e29b-41d4-a716-446655440000";
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: eventTitle,
  isCancelled: false,
  startsAt: new Date("2099-01-01T20:00:00.000Z"),
  ...overrides,
});

// O unitPrice e o totalValue do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildTicket = ({ ticketEventId = eventId, status = "active", quantity = 1, unitPrice = 50 } = {}) => ({
  eventId: ticketEventId,
  status,
  quantity,
  unitPrice: { toNumber: () => unitPrice },
});

const buildPayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  status: "confirmed",
  totalValue: { toNumber: () => 143 },
  ...overrides,
});

// Pedido padrão: 2 ingressos de 50 + 1 de 30 do evento cancelado = 130, mais 10% da taxa de serviço = 143 pagos

const buildOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "order 1",
  userId: "user 1",
  status: "confirmed",
  tickets: [buildTicket({ quantity: 2 }), buildTicket({ quantity: 1, unitPrice: 30 })],
  ticketPayments: [buildPayment()],
  ...overrides,
});

const buildPendingOrder = (overrides: Record<string, unknown> = {}) =>
  buildOrder({ status: "pending", ticketPayments: [buildPayment({ status: "pending" })], ...overrides });

// Pedido com um ingresso de outro evento: o reembolso é só do valor dos ingressos do evento cancelado (2 x 50 = 100, mais 10% = 110)

const buildPartialOrder = (overrides: Record<string, unknown> = {}) =>
  buildOrder({ tickets: [buildTicket({ quantity: 2 }), buildTicket({ ticketEventId: otherEventId, quantity: 1, unitPrice: 30 })], ...overrides });

const cancelledEventNotification = { type: "event_update", title: "Evento cancelado", message: `${eventTitle} foi cancelado.` };
const favoriteEventNotification = { type: "event_update", title: "Evento favorito cancelado", message: `${eventTitle} foi cancelado.` };

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockEventFindUnique.mockResolvedValue(buildDatabaseEvent());
  mockEventUpdate.mockResolvedValue({});
  mockOrderFindMany.mockResolvedValue([]);
  mockOrderUpdate.mockReturnValue("order update query");
  mockOrderUpdateMany.mockReturnValue("order update many query");
  mockPaymentUpdate.mockReturnValue("payment update query");
  mockPaymentUpdateMany.mockReturnValue("payment update many query");
  mockTicketUpdateMany.mockReturnValue("ticket update many query");
  mockTransaction.mockResolvedValue([]);
  mockRefundStripePayment.mockResolvedValue(true);
  mockNotifyUsersByEmail.mockResolvedValue(true);
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await cancelEvent(eventId);

  expect(result).toBe(false);
  expect(mockEventFindUnique).not.toHaveBeenCalled();
  expect(mockEventUpdate).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await cancelEvent(invalidId);

  expect(result).toBe(false);
  expect(mockEventFindUnique).not.toHaveBeenCalled();
  expect(mockEventUpdate).not.toHaveBeenCalled();
});

/* - Testando a consulta do evento - */

test("should look for the event to cancel by id", async () => {
  await cancelEvent(eventId);

  expect(mockEventFindUnique).toHaveBeenCalledWith({ where: { id: eventId } });
});

test("should return false and skip the cancellation when the event does not exist", async () => {
  mockEventFindUnique.mockResolvedValue(null);

  const result = await cancelEvent(eventId);

  expect(result).toBe(false);
  expect(mockEventUpdate).not.toHaveBeenCalled();
  expect(mockOrderFindMany).not.toHaveBeenCalled();
});

test("should return false and skip the cancellation and the refunds when the event already happened", async () => {
  mockEventFindUnique.mockResolvedValue(buildDatabaseEvent({ startsAt: pastStartsAt }));

  const result = await cancelEvent(eventId);

  expect(result).toBe(false);
  expect(mockEventUpdate).not.toHaveBeenCalled();
  expect(mockOrderFindMany).not.toHaveBeenCalled();
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
});

test.each([
  ["looking for the event", () => mockEventFindUnique],
  ["marking the event as cancelled", () => mockEventUpdate],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await cancelEvent(eventId);

  expect(result).toBe(false);
  expect(mockOrderFindMany).not.toHaveBeenCalled();
});

/* - Testando o cancelamento do evento - */

test("should mark the event as cancelled and return no pending refunds", async () => {
  const result = await cancelEvent(eventId);

  expect(mockEventUpdate).toHaveBeenCalledWith({ where: { id: eventId }, data: { isCancelled: true } });
  expect(result).toEqual({ pendingRefunds: 0 });
});

test("should skip the update, the cancellation notices and still look for orders when the event is already cancelled", async () => {
  mockEventFindUnique.mockResolvedValue(buildDatabaseEvent({ isCancelled: true }));

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 0 });
  expect(mockEventUpdate).not.toHaveBeenCalled();
  expect(mockOrderFindMany).toHaveBeenCalledTimes(1);
  expect(mockGetUserIdsThatFavoritedEvent).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando a consulta dos pedidos - */

test("should look for the orders that are not cancelled and still have active tickets of the event", async () => {
  await cancelEvent(eventId);

  expect(mockOrderFindMany).toHaveBeenCalledWith({
    where: { status: { not: "cancelled" }, tickets: { some: { eventId, status: "active" } } },
    include: { tickets: true, ticketPayments: true },
  });
});

test("should keep the event cancelled and return -1 when looking for the orders fails", async () => {
  mockOrderFindMany.mockRejectedValue(new Error("db error"));

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: -1 });
  expect(mockEventUpdate).toHaveBeenCalledWith({ where: { id: eventId }, data: { isCancelled: true } });
});

/* - Testando os pedidos pendentes (sem pagamento confirmado) - */

test("should cancel the order, the payment and the tickets of a pending order in the same transaction", async () => {
  mockOrderFindMany.mockResolvedValue([buildPendingOrder()]);

  await cancelEvent(eventId);

  expect(mockOrderUpdateMany).toHaveBeenCalledWith({ where: { id: "order 1", status: "pending" }, data: { status: "cancelled" } });
  expect(mockPaymentUpdateMany).toHaveBeenCalledWith({ where: { orderId: "order 1", status: "pending" }, data: { status: "cancelled" } });
  expect(mockTicketUpdateMany).toHaveBeenCalledWith({ where: { orderId: "order 1", status: "active" }, data: { status: "cancelled" } });
  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction).toHaveBeenCalledWith(["order update many query", "payment update many query", "ticket update many query"]);
});

test("should not refund a pending order and should notify the user that the order was cancelled", async () => {
  mockOrderFindMany.mockResolvedValue([buildPendingOrder()]);

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 0 });
  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], {
    type: "order_cancelled",
    title: "Pedido cancelado",
    message: `O evento ${eventTitle} foi cancelado, então o seu pedido pendente também foi cancelado.`,
  });
});

test("should treat an order without any payment as a pending order", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder({ ticketPayments: [] })]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).not.toHaveBeenCalled();
  expect(mockTransaction).toHaveBeenCalledWith(["order update many query", "payment update many query", "ticket update many query"]);
});

test("should count the order as pending and warn the user when cancelling a pending order fails", async () => {
  mockOrderFindMany.mockResolvedValue([buildPendingOrder()]);
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 1 });
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], cancelledEventNotification);
});

/* - Testando o reembolso total - */

test("should refund the whole payment when every ticket of the order was for the cancelled event", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder()]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).toHaveBeenCalledTimes(1);
  expect(mockRefundStripePayment).toHaveBeenCalledWith({
    paymentId: "payment 1",
    type: "tickets",
    amount: undefined,
    idempotencyKey: `refund-event-${eventId}-payment 1`,
  });
});

test("should treat the order as a full refund when the tickets of other events are already cancelled", async () => {
  mockOrderFindMany.mockResolvedValue([
    buildOrder({ tickets: [buildTicket({ quantity: 2 }), buildTicket({ ticketEventId: otherEventId, status: "cancelled" })] }),
  ]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).toHaveBeenCalledWith(expect.objectContaining({ amount: undefined }));
});

test("should cancel the order, mark the payment as refunded and cancel the tickets only after the Stripe refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder()]);

  await cancelEvent(eventId);

  expect(mockOrderUpdate).toHaveBeenCalledWith({ where: { id: "order 1", status: "confirmed" }, data: { status: "cancelled" } });
  expect(mockPaymentUpdate).toHaveBeenCalledWith({ where: { id: "payment 1", status: "confirmed" }, data: { status: "refunded" } });
  expect(mockTicketUpdateMany).toHaveBeenCalledWith({ where: { orderId: "order 1", eventId, status: "active" }, data: { status: "cancelled" } });
  expect(mockTransaction).toHaveBeenCalledWith(["order update query", "payment update query", "ticket update many query"]);
  expect(mockRefundStripePayment.mock.invocationCallOrder[0]).toBeLessThan(mockTransaction.mock.invocationCallOrder[0]);
});

test("should notify the user with the total value of the payment after a full refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder()]);

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 0 });
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], {
    type: "order_cancelled",
    title: "Pedido reembolsado",
    message: `O evento ${eventTitle} foi cancelado e R$ 143.00 serão reembolsados`,
  });
});

/* - Testando o reembolso parcial - */

test("should refund only the value of the tickets of the cancelled event plus the service fee when the order has other events", async () => {
  mockOrderFindMany.mockResolvedValue([buildPartialOrder()]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).toHaveBeenCalledWith({
    paymentId: "payment 1",
    type: "tickets",
    amount: 110,
    idempotencyKey: `refund-event-${eventId}-payment 1`,
  });
});

test("should round the partial refund to cents", async () => {
  mockOrderFindMany.mockResolvedValue([
    buildPartialOrder({ tickets: [buildTicket({ quantity: 3, unitPrice: 19.9 }), buildTicket({ ticketEventId: otherEventId })] }),
  ]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).toHaveBeenCalledWith(expect.objectContaining({ amount: 65.67 }));
});

test("should ignore the tickets of the cancelled event that were already cancelled in the partial refund", async () => {
  mockOrderFindMany.mockResolvedValue([
    buildPartialOrder({
      tickets: [buildTicket({ quantity: 2 }), buildTicket({ status: "cancelled", unitPrice: 999 }), buildTicket({ ticketEventId: otherEventId })],
    }),
  ]);

  await cancelEvent(eventId);

  expect(mockRefundStripePayment).toHaveBeenCalledWith(expect.objectContaining({ amount: 110 }));
});

test("should only cancel the tickets of the cancelled event and keep the order and the payment after a partial refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildPartialOrder()]);

  await cancelEvent(eventId);

  expect(mockTicketUpdateMany).toHaveBeenCalledWith({ where: { orderId: "order 1", eventId, status: "active" }, data: { status: "cancelled" } });
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockOrderUpdate).not.toHaveBeenCalled();
  expect(mockPaymentUpdate).not.toHaveBeenCalled();
});

test("should notify the user with the partial value after a partial refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildPartialOrder()]);

  await cancelEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], {
    type: "order_cancelled",
    title: "Pedido reembolsado",
    message: `O evento ${eventTitle} foi cancelado e R$ 110.00 serão reembolsados`,
  });
});

/* - Testando as falhas do reembolso - */

test.each([
  ["the Stripe refund is refused", () => mockRefundStripePayment.mockResolvedValue(false)],
  ["the Stripe refund throws", () => mockRefundStripePayment.mockRejectedValue(new Error("stripe error"))],
  ["saving the refund in the database fails", () => mockTransaction.mockRejectedValue(new Error("db error"))],
])("should count the order as pending when %s", async (_description, setupFailure) => {
  mockOrderFindMany.mockResolvedValue([buildOrder()]);
  setupFailure();

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 1 });
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalledWith(["user 1"], expect.objectContaining({ title: "Pedido reembolsado" }));
});

test.each([
  ["a full refund", () => buildOrder()],
  ["a partial refund", () => buildPartialOrder()],
])("should keep the order untouched when the Stripe refund fails in %s", async (_description, buildFailingOrder) => {
  mockOrderFindMany.mockResolvedValue([buildFailingOrder()]);
  mockRefundStripePayment.mockResolvedValue(false);

  await cancelEvent(eventId);

  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

test("should keep processing the other orders when one of them fails", async () => {
  mockOrderFindMany.mockResolvedValue([
    buildOrder({ id: "order 1", userId: "user 1", ticketPayments: [buildPayment({ id: "payment 1" })] }),
    buildOrder({ id: "order 2", userId: "user 2", ticketPayments: [buildPayment({ id: "payment 2" })] }),
  ]);
  mockRefundStripePayment.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 1 });
  expect(mockRefundStripePayment).toHaveBeenCalledTimes(2);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 2"], expect.objectContaining({ title: "Pedido reembolsado" }));
});

test("should return the number of orders that still need a refund when reprocessing an already cancelled event", async () => {
  mockEventFindUnique.mockResolvedValue(buildDatabaseEvent({ isCancelled: true }));
  mockOrderFindMany.mockResolvedValue([buildOrder()]);
  mockRefundStripePayment.mockResolvedValue(false);

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 1 });
  expect(mockEventUpdate).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalled();
});

/* - Testando os avisos do cancelamento - */

test("should notify the users with a failed refund that the event was cancelled, without promising the refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder()]);
  mockRefundStripePayment.mockResolvedValue(false);

  await cancelEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], cancelledEventNotification);
});

test("should notify the users who favorited the event", async () => {
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(["user 1", "user 2"]);

  await cancelEvent(eventId);

  expect(mockGetUserIdsThatFavoritedEvent).toHaveBeenCalledWith(eventId);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1", "user 2"], favoriteEventNotification);
});

test("should not notify again a favorite who was already notified by their own order", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder({ userId: "user 1" })]);
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(["user 1", "user 2"]);

  await cancelEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 2"], favoriteEventNotification);
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalledWith(expect.arrayContaining(["user 1"]), favoriteEventNotification);
});

test("should still notify a favorite whose order notification was not sent", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder({ userId: "user 1" })]);
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(["user 1"]);
  mockNotifyUsersByEmail.mockResolvedValueOnce(false);

  await cancelEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], favoriteEventNotification);
});

test("should send a single notice to a favorite with a failed refund", async () => {
  mockOrderFindMany.mockResolvedValue([buildOrder({ userId: "user 1" })]);
  mockRefundStripePayment.mockResolvedValue(false);
  mockGetUserIdsThatFavoritedEvent.mockResolvedValue(["user 1", "user 2"]);

  await cancelEvent(eventId);

  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], cancelledEventNotification);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 2"], favoriteEventNotification);
  expect(mockNotifyUsersByEmail).not.toHaveBeenCalledWith(expect.arrayContaining(["user 1"]), favoriteEventNotification);
});

test("should not warn about the cancellation a user who was already notified by another order", async () => {
  mockOrderFindMany.mockResolvedValue([
    buildOrder({ id: "order 1", userId: "user 1", ticketPayments: [buildPayment({ id: "payment 1" })] }),
    buildOrder({ id: "order 2", userId: "user 1", ticketPayments: [buildPayment({ id: "payment 2" })] }),
  ]);
  mockRefundStripePayment.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 1 });
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith([], cancelledEventNotification);
});

test("should not look for the favorites when reprocessing an already cancelled event", async () => {
  mockEventFindUnique.mockResolvedValue(buildDatabaseEvent({ isCancelled: true }));
  mockOrderFindMany.mockResolvedValue([buildOrder()]);

  await cancelEvent(eventId);

  expect(mockGetUserIdsThatFavoritedEvent).not.toHaveBeenCalled();
  expect(mockNotifyUsersByEmail).toHaveBeenCalledTimes(1);
  expect(mockNotifyUsersByEmail).toHaveBeenCalledWith(["user 1"], expect.objectContaining({ title: "Pedido reembolsado" }));
});

test.each([
  ["notifying the users", () => mockNotifyUsersByEmail],
  ["looking for the favorites", () => mockGetUserIdsThatFavoritedEvent],
])("should still return the result and keep the event cancelled when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("notification error"));

  const result = await cancelEvent(eventId);

  expect(result).toEqual({ pendingRefunds: 0 });
  expect(mockEventUpdate).toHaveBeenCalledWith({ where: { id: eventId }, data: { isCancelled: true } });
});
