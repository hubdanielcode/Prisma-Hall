import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { refundStripePayment } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";
import { stripe } from "@/lib/server/services/stripe";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

vi.mock("@/lib/server/services/stripe", () => ({
  stripe: {
    checkout: { sessions: { list: vi.fn() } },
    paymentIntents: { retrieve: vi.fn(), search: vi.fn() },
    refunds: { create: vi.fn() },
  },
}));

const mockTicketPaymentFindUnique = prisma.ticketPayment.findUnique as unknown as Mock;
const mockVoucherPaymentFindUnique = prisma.voucherPayment.findUnique as unknown as Mock;
const mockSessionsList = stripe.checkout.sessions.list as unknown as Mock;
const mockPaymentIntentsRetrieve = stripe.paymentIntents.retrieve as unknown as Mock;
const mockPaymentIntentsSearch = stripe.paymentIntents.search as unknown as Mock;
const mockRefundsCreate = stripe.refunds.create as unknown as Mock;

/* - Funções e dados auxiliares - */

const paymentId = "payment-1";
const paymentCreatedAt = new Date("2026-01-10T12:00:00.000Z");

const buildDatabasePayment = (overrides: Record<string, unknown> = {}) => ({
  id: paymentId,
  status: "confirmed",
  method: "creditCard",
  totalValue: { toNumber: () => 50 },
  paymentIntentId: "pi_1",
  createdAt: paymentCreatedAt,
  ...overrides,
});

const buildCharge = (amount: number, amountRefunded = 0) => ({ latest_charge: { amount, amount_refunded: amountRefunded } });

const buildSessionList = (sessions: Record<string, unknown>[]) =>
  (async function* () {
    yield* sessions;
  })();

const buildEndlessSessionList = (onSession: () => void) =>
  (async function* () {
    while (true) {
      onSession();
      yield { id: "cs_other", metadata: {}, status: "open" };
    }
  })();

const buildPaymentSession = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_1",
  metadata: { ticketPaymentId: paymentId },
  status: "complete",
  payment_intent: "pi_old",
  ...overrides,
});

beforeEach(() => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment());
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabasePayment());
  mockSessionsList.mockImplementation(() => buildSessionList([]));
  mockPaymentIntentsRetrieve.mockResolvedValue(buildCharge(5000));
  mockPaymentIntentsSearch.mockResolvedValue({ data: [] });
  mockRefundsCreate.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando a consulta ao banco - */

test("should look for the payment in the ticket payments when the type is tickets", async () => {
  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockTicketPaymentFindUnique).toHaveBeenCalledTimes(1);
  expect(mockTicketPaymentFindUnique).toHaveBeenCalledWith({ where: { id: paymentId } });
  expect(mockVoucherPaymentFindUnique).not.toHaveBeenCalled();
});

test("should look for the payment in the voucher payments when the type is drinks", async () => {
  await refundStripePayment({ paymentId, type: "drinks" });

  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledTimes(1);
  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledWith({ where: { id: paymentId } });
  expect(mockTicketPaymentFindUnique).not.toHaveBeenCalled();
});

/* - Testando os pagamentos que não podem ser reembolsados - */

test("should return false and skip stripe when the payment does not exist", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(null);

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

test.each([
  ["pending", "pending"],
  ["refunded", "refunded"],
  ["cancelled", "cancelled"],
  ["failed", "failed"],
])("should return false and skip stripe when the payment is %s", async (_description, status) => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ status }));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

/* - Testando a validação do valor - */

test("should return true and skip stripe when the payment has no value to refund", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ totalValue: { toNumber: () => 0 } }));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

test.each([
  ["zero", 0],
  ["negative", -5],
  ["greater than the total value", 50.01],
])("should return false and skip stripe when the partial amount is %s", async (_description, amount) => {
  const result = await refundStripePayment({ paymentId, type: "tickets", amount });

  expect(result).toBe(false);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

/* - Testando os pagamentos sem cobrança no Stripe - */

test.each([
  ["a full refund", undefined],
  ["a partial refund", 20],
])("should return true and skip stripe when the payment was made in cash and it is %s", async (_description, amount) => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ method: "cash", paymentIntentId: null }));

  const result = await refundStripePayment({ paymentId, type: "tickets", amount });

  expect(result).toBe(true);
  expect(mockSessionsList).not.toHaveBeenCalled();
  expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

/* - Testando a busca da cobrança de pagamentos antigos - */

test("should use the payment intent saved in the payment without searching stripe", async () => {
  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockSessionsList).not.toHaveBeenCalled();
  expect(mockPaymentIntentsSearch).not.toHaveBeenCalled();
  expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_1" }), expect.anything());
});

test("should list the checkout sessions created a bit before the payment when it has no payment intent saved", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));

  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockSessionsList).toHaveBeenCalledTimes(1);
  expect(mockSessionsList).toHaveBeenCalledWith({ created: { gte: Math.floor(paymentCreatedAt.getTime() / 1000) - 300 }, limit: 100 });
});

test.each([
  ["a ticket payment", "tickets", "ticketPaymentId"],
  ["a voucher payment", "drinks", "voucherPaymentId"],
])("should refund the payment intent of the completed checkout session of %s", async (_description, type, metadataKey) => {
  const payment = buildDatabasePayment({ paymentIntentId: null });

  mockTicketPaymentFindUnique.mockResolvedValue(payment);
  mockVoucherPaymentFindUnique.mockResolvedValue(payment);
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession({ metadata: { [metadataKey]: paymentId } })]));

  const result = await refundStripePayment({ paymentId, type: type as "tickets" | "drinks" });

  expect(result).toBe(true);
  expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_old" }), expect.anything());
});

test("should read the payment intent id when the checkout session brings the payment intent as an object", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession({ payment_intent: { id: "pi_object" } })]));

  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_object" }), expect.anything());
});

test("should ignore the sessions of other payments, the ones not completed and the ones without payment intent", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));
  mockSessionsList.mockImplementation(() =>
    buildSessionList([
      buildPaymentSession({ id: "cs_a", metadata: { ticketPaymentId: "other payment" }, payment_intent: "pi_other" }),
      buildPaymentSession({ id: "cs_b", status: "open", payment_intent: "pi_open" }),
      buildPaymentSession({ id: "cs_c", payment_intent: null }),
      buildPaymentSession({ id: "cs_d", payment_intent: "pi_right" }),
    ]),
  );

  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_right" }), expect.anything());
});

test("should search the payment intent in stripe when the sessions list does not have the payment", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));
  mockPaymentIntentsSearch.mockResolvedValue({ data: [{ id: "pi_searched" }] });

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockPaymentIntentsSearch).toHaveBeenCalledTimes(1);
  expect(mockPaymentIntentsSearch).toHaveBeenCalledWith({ query: `metadata['ticketPaymentId']:'${paymentId}' AND status:'succeeded'` });
  expect(mockRefundsCreate).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_searched" }), expect.anything());
});

test("should search with the voucher metadata key when the type is drinks", async () => {
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));

  await refundStripePayment({ paymentId, type: "drinks" });

  expect(mockPaymentIntentsSearch).toHaveBeenCalledWith({ query: `metadata['voucherPaymentId']:'${paymentId}' AND status:'succeeded'` });
});

test("should stop listing sessions after 500 and fall back to the search", async () => {
  let checkedSessions = 0;

  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));
  mockSessionsList.mockImplementation(() =>
    buildEndlessSessionList(() => {
      checkedSessions += 1;
    }),
  );

  await refundStripePayment({ paymentId, type: "tickets" });

  expect(checkedSessions).toBe(500);
  expect(mockPaymentIntentsSearch).toHaveBeenCalledTimes(1);
});

test("should return false and log the error when the payment intent is not found anywhere", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalledWith(`Cobrança não encontrada no Stripe. Pagamento: ${paymentId}`);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

/* - Testando o reembolso total - */

test("should check how much of the charge can still be refunded", async () => {
  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockPaymentIntentsRetrieve).toHaveBeenCalledTimes(1);
  expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith("pi_1", { expand: ["latest_charge"] });
});

test("should refund the whole value in cents with an idempotency key made from the type, the payment and the value", async () => {
  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 5000 }, { idempotencyKey: `refund-tickets-${paymentId}-5000` });
});

test("should use the drinks type in the idempotency key of the voucher payments", async () => {
  await refundStripePayment({ paymentId, type: "drinks" });

  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 5000 }, { idempotencyKey: `refund-drinks-${paymentId}-5000` });
});

test("should round the value to cents without floating point errors", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ totalValue: { toNumber: () => 19.99 } }));
  mockPaymentIntentsRetrieve.mockResolvedValue(buildCharge(1999));

  await refundStripePayment({ paymentId, type: "tickets" });

  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 1999 }, { idempotencyKey: `refund-tickets-${paymentId}-1999` });
});

test("should refund only what is left in the charge after previous partial refunds", async () => {
  mockPaymentIntentsRetrieve.mockResolvedValue(buildCharge(5000, 2000));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 3000 }, { idempotencyKey: `refund-tickets-${paymentId}-3000` });
});

test("should return true without refunding when nothing is left in the charge", async () => {
  mockPaymentIntentsRetrieve.mockResolvedValue(buildCharge(5000, 5000));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

test.each([
  ["no charge", { latest_charge: null }],
  ["a charge that was not expanded", { latest_charge: "ch_1" }],
])("should refund the whole value when the payment intent has %s", async (_description, paymentIntent) => {
  mockPaymentIntentsRetrieve.mockResolvedValue(paymentIntent);

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 5000 }, { idempotencyKey: `refund-tickets-${paymentId}-5000` });
});

test("should use the idempotency key given by the caller in a full refund", async () => {
  await refundStripePayment({ paymentId, type: "tickets", idempotencyKey: "custom-key" });

  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 5000 }, { idempotencyKey: "custom-key" });
});

/* - Testando o reembolso parcial - */

test("should refund only the given amount in cents without checking the charge or creating an idempotency key", async () => {
  const result = await refundStripePayment({ paymentId, type: "tickets", amount: 20 });

  expect(result).toBe(true);
  expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
  expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 2000 }, undefined);
});

test("should use the idempotency key given by the caller in a partial refund", async () => {
  await refundStripePayment({ paymentId, type: "tickets", amount: 20, idempotencyKey: "custom-key" });

  expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_1", amount: 2000 }, { idempotencyKey: "custom-key" });
});

/* - Testando as falhas do Stripe e do banco - */

test("should return false and log the error when stripe fails to create the refund", async () => {
  mockRefundsCreate.mockRejectedValue(new Error("stripe error"));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalledWith(`Reembolso no Stripe falhou. Pagamento: ${paymentId}`, expect.any(Error));
});

test("should return true in a full refund when the charge was already refunded in a previous attempt", async () => {
  mockRefundsCreate.mockRejectedValue({ code: "charge_already_refunded" });

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(true);
});

test("should return false in a partial refund when the charge was already refunded", async () => {
  mockRefundsCreate.mockRejectedValue({ code: "charge_already_refunded" });

  const result = await refundStripePayment({ paymentId, type: "tickets", amount: 20 });

  expect(result).toBe(false);
});

test.each([
  ["another error code", { code: "api_connection_error" }],
  ["an error without code", new Error("stripe error")],
  ["a value that is not an object", "charge_already_refunded"],
])("should return false in a full refund when stripe fails with %s", async (_description, error) => {
  mockRefundsCreate.mockRejectedValue(error);

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
});

test.each([
  ["looking for the payment", () => mockTicketPaymentFindUnique],
  ["checking the remaining value of the charge", () => mockPaymentIntentsRetrieve],
])("should return false and skip the refund when it fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});

test("should return false when listing the checkout sessions fails", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabasePayment({ paymentIntentId: null }));
  mockSessionsList.mockImplementation(() => {
    throw new Error("stripe error");
  });

  const result = await refundStripePayment({ paymentId, type: "tickets" });

  expect(result).toBe(false);
  expect(mockRefundsCreate).not.toHaveBeenCalled();
});
