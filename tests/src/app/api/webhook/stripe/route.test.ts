import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { cancelUnpaidOrders, getRealCardMethod, markOrderAsPaid, stripe } from "@/lib/server";

/* - Mocks das dependências externas (server-only vem do vitest.setup) - */

vi.mock("@/lib/server", () => ({
  cancelUnpaidOrders: vi.fn(),
  getRealCardMethod: vi.fn(),
  markOrderAsPaid: vi.fn(),
  stripe: { webhooks: { constructEvent: vi.fn() }, checkout: { sessions: { list: vi.fn() } } },
}));

const mockCancelUnpaidOrders = cancelUnpaidOrders as unknown as Mock;
const mockGetRealCardMethod = getRealCardMethod as unknown as Mock;
const mockMarkOrderAsPaid = markOrderAsPaid as unknown as Mock;
const mockConstructEvent = stripe.webhooks.constructEvent as unknown as Mock;
const mockListSessions = stripe.checkout.sessions.list as unknown as Mock;

/* - Funções e dados auxiliares - */

type SessionOverrides = Record<string, unknown>;

const webhookSecret = "whsec_test";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildRequest = ({ signature = "stripe signature", body = "raw body" }: { signature?: string | null; body?: string } = {}) =>
  new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  });

const buildSession = (overrides: SessionOverrides = {}) => ({
  id: "cs_1",
  status: "complete",
  payment_status: "paid",
  payment_intent: "pi_1",
  metadata: { ticketPaymentId: "ticket payment 1" },
  ...overrides,
});

const buildEvent = (type: string, sessionOverrides: SessionOverrides = {}) => ({ type, data: { object: buildSession(sessionOverrides) } });

// O Stripe devolve a lista paginada como um async iterable, por isso o mock também é um

const mockSessions = (sessions: SessionOverrides[]) => {
  mockListSessions.mockImplementation(async function* () {
    for (const session of sessions) {
      yield session;
    }
  });
};

const callWebhook = async (event: unknown) => {
  mockConstructEvent.mockReturnValue(event);

  const response = await POST(buildRequest());

  return { response, body: await response.json() };
};

beforeEach(() => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", webhookSecret);

  mockConstructEvent.mockReturnValue(buildEvent("checkout.session.completed"));
  mockGetRealCardMethod.mockResolvedValue("creditCard");
  mockMarkOrderAsPaid.mockResolvedValue(true);
  mockCancelUnpaidOrders.mockResolvedValue(true);
  mockSessions([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

/* - Testando a assinatura - */

test("should return 400 and skip everything when the stripe signature header is missing", async () => {
  const response = await POST(buildRequest({ signature: null }));

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Assinatura ausente" });
  expect(mockConstructEvent).not.toHaveBeenCalled();
  expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

test("should return 400 and skip everything when the signature is not valid", async () => {
  mockConstructEvent.mockImplementation(() => {
    throw new Error("invalid signature");
  });

  const response = await POST(buildRequest());

  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Assinatura inválida" });
  expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

test("should validate the raw body with the signature header and the webhook secret", async () => {
  await POST(buildRequest({ signature: "my signature", body: "my raw body" }));

  expect(mockConstructEvent).toHaveBeenCalledTimes(1);
  expect(mockConstructEvent).toHaveBeenCalledWith("my raw body", "my signature", webhookSecret);
});

/* - Testando o pagamento confirmado - */

test.each(["checkout.session.completed", "checkout.session.async_payment_succeeded"])(
  "should mark the order as paid and return received when the event is %s",
  async (type) => {
    const { response, body } = await callWebhook(buildEvent(type));

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockMarkOrderAsPaid).toHaveBeenCalledTimes(1);
    expect(mockMarkOrderAsPaid).toHaveBeenCalledWith({
      ticketPaymentId: "ticket payment 1",
      voucherPaymentId: undefined,
      stripeMethod: "creditCard",
      paymentIntentId: "pi_1",
    });
    expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
  },
);

test("should ask for the real card method using the checkout session", async () => {
  await callWebhook(buildEvent("checkout.session.completed"));

  expect(mockGetRealCardMethod).toHaveBeenCalledTimes(1);
  expect(mockGetRealCardMethod).toHaveBeenCalledWith(expect.objectContaining({ id: "cs_1" }));
});

test.each([
  ["a debit card", "debitCard"],
  ["no card method", undefined],
])("should send the method to markOrderAsPaid when the real method is %s", async (_description, stripeMethod) => {
  mockGetRealCardMethod.mockResolvedValue(stripeMethod);

  await callWebhook(buildEvent("checkout.session.completed"));

  expect(mockMarkOrderAsPaid).toHaveBeenCalledWith(expect.objectContaining({ stripeMethod }));
});

test("should send the voucher payment id when the session is from a voucher order", async () => {
  await callWebhook(buildEvent("checkout.session.completed", { metadata: { voucherPaymentId: "voucher payment 1" } }));

  expect(mockMarkOrderAsPaid).toHaveBeenCalledWith(expect.objectContaining({ ticketPaymentId: undefined, voucherPaymentId: "voucher payment 1" }));
});

test.each([
  ["empty strings", { ticketPaymentId: "", voucherPaymentId: "" }],
  ["no metadata", null],
])("should send undefined ids to markOrderAsPaid when the session has %s", async (_description, metadata) => {
  await callWebhook(buildEvent("checkout.session.completed", { metadata }));

  expect(mockMarkOrderAsPaid).toHaveBeenCalledWith(expect.objectContaining({ ticketPaymentId: undefined, voucherPaymentId: undefined }));
});

test.each([
  ["a string", "pi_1", "pi_1"],
  ["an expanded object", { id: "pi_2" }, "pi_2"],
  ["null", null, undefined],
])("should read the payment intent id when the payment intent is %s", async (_description, paymentIntent, expectedId) => {
  await callWebhook(buildEvent("checkout.session.completed", { payment_intent: paymentIntent }));

  expect(mockMarkOrderAsPaid).toHaveBeenCalledWith(expect.objectContaining({ paymentIntentId: expectedId }));
});

test.each(["checkout.session.completed", "checkout.session.async_payment_succeeded"])(
  "should return received without marking the order as paid when the %s event is not paid yet (Pix)",
  async (type) => {
    const { response, body } = await callWebhook(buildEvent(type, { payment_status: "unpaid" }));

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockGetRealCardMethod).not.toHaveBeenCalled();
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  },
);

/* - Testando as falhas ao confirmar o pagamento - */

test("should return 500 so stripe retries the event when the order could not be marked as paid", async () => {
  mockMarkOrderAsPaid.mockResolvedValue(false);

  const { response, body } = await callWebhook(buildEvent("checkout.session.completed"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao confirmar o pagamento" });
});

test("should return 500 when markOrderAsPaid throws", async () => {
  mockMarkOrderAsPaid.mockRejectedValue(new Error("db error"));

  const { response, body } = await callWebhook(buildEvent("checkout.session.completed"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao processar" });
});

test("should return 500 and skip markOrderAsPaid when getting the real card method throws", async () => {
  mockGetRealCardMethod.mockRejectedValue(new Error("stripe error"));

  const { response, body } = await callWebhook(buildEvent("checkout.session.completed"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao processar" });
  expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
});

/* - Testando a sessão expirada ou com pagamento falho - */

test.each(["checkout.session.expired", "checkout.session.async_payment_failed"])(
  "should cancel the unpaid orders and return received when the event is %s",
  async (type) => {
    const { response, body } = await callWebhook(buildEvent(type, { status: "expired", payment_status: "unpaid" }));

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockCancelUnpaidOrders).toHaveBeenCalledTimes(1);
    expect(mockCancelUnpaidOrders).toHaveBeenCalledWith({ ticketPaymentId: "ticket payment 1", voucherPaymentId: undefined });
    expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  },
);

test("should send the voucher payment id when the expired session is from a voucher order", async () => {
  await callWebhook(buildEvent("checkout.session.expired", { metadata: { voucherPaymentId: "voucher payment 1" } }));

  expect(mockCancelUnpaidOrders).toHaveBeenCalledWith({ ticketPaymentId: undefined, voucherPaymentId: "voucher payment 1" });
});

test("should look for the other sessions created in the last 48 hours", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  await callWebhook(buildEvent("checkout.session.expired"));

  expect(mockListSessions).toHaveBeenCalledTimes(1);
  expect(mockListSessions).toHaveBeenCalledWith({ limit: 500, created: { gte: Math.floor(now.getTime() / 1000) - 60 * 60 * 48 } });
});

/* - Testando a sessão nova aberta para o mesmo pedido - */

test.each([
  ["is still open", { status: "open", payment_status: "unpaid" }],
  ["was already paid", { status: "complete", payment_status: "paid" }],
])("should keep the order when another session for the same order %s", async (_description, otherSession) => {
  mockSessions([buildSession({ id: "cs_2", ...otherSession })]);

  const { response, body } = await callWebhook(buildEvent("checkout.session.expired", { status: "expired", payment_status: "unpaid" }));

  expect(response.status).toBe(200);
  expect(body).toEqual({ received: true });
  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

test("should keep the voucher order when another session for the same voucher order is open", async () => {
  mockSessions([buildSession({ id: "cs_2", status: "open", payment_status: "unpaid", metadata: { voucherPaymentId: "voucher payment 1" } })]);

  await callWebhook(buildEvent("checkout.session.expired", { metadata: { voucherPaymentId: "voucher payment 1" } }));

  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

test.each([
  ["is expired and unpaid", { id: "cs_2", status: "expired", payment_status: "unpaid" }],
  ["is the session that ended", { id: "cs_1", status: "open", payment_status: "unpaid" }],
  ["is from another ticket order", { id: "cs_2", status: "open", payment_status: "unpaid", metadata: { ticketPaymentId: "ticket payment 2" } }],
  ["is from a voucher order", { id: "cs_2", status: "open", payment_status: "unpaid", metadata: { voucherPaymentId: "voucher payment 1" } }],
])("should still cancel the unpaid orders when the other session %s", async (_description, otherSession) => {
  mockSessions([buildSession(otherSession)]);

  await callWebhook(buildEvent("checkout.session.expired", { status: "expired", payment_status: "unpaid" }));

  expect(mockCancelUnpaidOrders).toHaveBeenCalledTimes(1);
});

test("should find the active session for the same order even when it is not the first one in the list", async () => {
  mockSessions([
    buildSession({ id: "cs_2", status: "open", metadata: { ticketPaymentId: "ticket payment 2" } }),
    buildSession({ id: "cs_3", status: "expired", payment_status: "unpaid" }),
    buildSession({ id: "cs_4", status: "open", payment_status: "unpaid" }),
  ]);

  await callWebhook(buildEvent("checkout.session.expired"));

  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

test("should stop looking after checking 500 sessions", async () => {
  let yieldedSessions = 0;

  mockListSessions.mockImplementation(async function* () {
    while (yieldedSessions < 600) {
      yieldedSessions += 1;

      yield buildSession({ id: `cs_other_${yieldedSessions}`, status: "open", metadata: { ticketPaymentId: `other payment ${yieldedSessions}` } });
    }
  });

  await callWebhook(buildEvent("checkout.session.expired"));

  expect(yieldedSessions).toBe(500);
  expect(mockCancelUnpaidOrders).toHaveBeenCalledTimes(1);
});

/* - Testando as falhas ao cancelar o pedido - */

test("should return 500 so stripe retries the event when the unpaid orders could not be cancelled", async () => {
  mockCancelUnpaidOrders.mockResolvedValue(false);

  const { response, body } = await callWebhook(buildEvent("checkout.session.expired"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao cancelar o pedido não pago" });
});

test("should return 500 when cancelUnpaidOrders throws", async () => {
  mockCancelUnpaidOrders.mockRejectedValue(new Error("db error"));

  const { response, body } = await callWebhook(buildEvent("checkout.session.expired"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao processar" });
});

test("should return 500 and skip the cancellation when listing the other sessions fails", async () => {
  mockListSessions.mockImplementation(() => {
    throw new Error("stripe error");
  });

  const { response, body } = await callWebhook(buildEvent("checkout.session.expired"));

  expect(response.status).toBe(500);
  expect(body).toEqual({ error: "Falha ao processar" });
  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});

/* - Testando os outros eventos - */

test("should return received without doing anything when the event type is not handled", async () => {
  const { response, body } = await callWebhook(buildEvent("charge.refunded"));

  expect(response.status).toBe(200);
  expect(body).toEqual({ received: true });
  expect(mockGetRealCardMethod).not.toHaveBeenCalled();
  expect(mockMarkOrderAsPaid).not.toHaveBeenCalled();
  expect(mockListSessions).not.toHaveBeenCalled();
  expect(mockCancelUnpaidOrders).not.toHaveBeenCalled();
});
