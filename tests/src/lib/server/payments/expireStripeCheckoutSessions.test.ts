import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { expireStripeCheckoutSessions } from "@/lib/server";
import { stripe } from "@/lib/server/services/stripe";

/* - Mocks das dependências externas - */

vi.mock("@/lib/server/services/stripe", () => ({
  stripe: { checkout: { sessions: { list: vi.fn(), expire: vi.fn() } } },
}));

const mockSessionsList = stripe.checkout.sessions.list as unknown as Mock;
const mockSessionsExpire = stripe.checkout.sessions.expire as unknown as Mock;

/* - Funções e dados auxiliares - */

const paymentId = "payment-1";
const paymentCreatedAt = new Date("2026-06-15T12:00:00.000Z");

const buildSession = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_other",
  metadata: {},
  status: "open",
  ...overrides,
});

const buildPaymentSession = (overrides: Record<string, unknown> = {}) =>
  buildSession({ id: "cs_payment", metadata: { ticketPaymentId: paymentId }, ...overrides });

const buildSessionList = (sessions: Record<string, unknown>[]) =>
  (async function* () {
    yield* sessions;
  })();

const buildEndlessSessionList = (onSession: () => void) =>
  (async function* () {
    while (true) {
      onSession();
      yield buildSession();
    }
  })();

beforeEach(() => {
  mockSessionsList.mockImplementation(() => buildSessionList([]));
  mockSessionsExpire.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando a consulta ao Stripe - */

test("should list the sessions created from 5 minutes before the payment", async () => {
  await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(mockSessionsList).toHaveBeenCalledTimes(1);
  expect(mockSessionsList).toHaveBeenCalledWith({ created: { gte: Math.floor(paymentCreatedAt.getTime() / 1000) - 300 }, limit: 100 });
});

/* - Testando a expiração das sessões abertas - */

test.each([
  ["a ticket payment", "ticketPaymentId"],
  ["a voucher payment", "voucherPaymentId"],
])("should expire the open session of %s", async (_description, metadataKey) => {
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession({ metadata: { [metadataKey]: paymentId } })]));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).toHaveBeenCalledTimes(1);
  expect(mockSessionsExpire).toHaveBeenCalledWith("cs_payment");
});

test("should expire every open session of the payment", async () => {
  mockSessionsList.mockImplementation(() =>
    buildSessionList([buildPaymentSession({ id: "cs_1" }), buildSession({ id: "cs_x" }), buildPaymentSession({ id: "cs_2" })]),
  );

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).toHaveBeenCalledTimes(2);
  expect(mockSessionsExpire).toHaveBeenCalledWith("cs_1");
  expect(mockSessionsExpire).toHaveBeenCalledWith("cs_2");
});

test("should not expire the sessions of other payments", async () => {
  mockSessionsList.mockImplementation(() =>
    buildSessionList([
      buildSession({ id: "cs_a", metadata: { ticketPaymentId: "other payment" } }),
      buildSession({ id: "cs_b", metadata: { voucherPaymentId: "other payment" } }),
      buildSession({ id: "cs_c" }),
    ]),
  );

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).not.toHaveBeenCalled();
});

test("should not expire a session of the payment that is already expired", async () => {
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession({ status: "expired" })]));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).not.toHaveBeenCalled();
});

test("should return true when there are no sessions", async () => {
  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).not.toHaveBeenCalled();
});

/* - Testando a sessão já paga - */

test("should return false and not expire anything when the session of the payment was already completed", async () => {
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession({ status: "complete" })]));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(false);
  expect(mockSessionsExpire).not.toHaveBeenCalled();
});

/* - Testando o limite de 500 sessões - */

test("should stop listing the sessions after 500 and return false when the payment session was not found", async () => {
  let checkedSessions = 0;

  mockSessionsList.mockImplementation(() =>
    buildEndlessSessionList(() => {
      checkedSessions += 1;
    }),
  );

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(false);
  expect(checkedSessions).toBe(500);
  expect(console.error).toHaveBeenCalledWith(`Sessão do Stripe não encontrada nas 500 mais recentes. Pagamento: ${paymentId}`);
});

test("should return true when the limit is reached but the payment session was found and expired", async () => {
  const sessions = Array.from({ length: 500 }, (_, index) => (index === 2 ? buildPaymentSession() : buildSession({ id: `cs_${index}` })));

  mockSessionsList.mockImplementation(() => buildSessionList(sessions));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
  expect(mockSessionsExpire).toHaveBeenCalledTimes(1);
  expect(mockSessionsExpire).toHaveBeenCalledWith("cs_payment");
});

test("should return true when there are fewer than 500 sessions and the payment session was not found", async () => {
  const sessions = Array.from({ length: 499 }, (_, index) => buildSession({ id: `cs_${index}` }));

  mockSessionsList.mockImplementation(() => buildSessionList(sessions));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(true);
});

/* - Testando as falhas do Stripe - */

test("should return false and log the error when listing the sessions fails", async () => {
  mockSessionsList.mockImplementation(() => {
    throw new Error("stripe error");
  });

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalledWith(`Expiração das sessões do Stripe falhou. Pagamento: ${paymentId}`, expect.any(Error));
});

test("should return false and log the error when expiring a session fails", async () => {
  mockSessionsList.mockImplementation(() => buildSessionList([buildPaymentSession()]));
  mockSessionsExpire.mockRejectedValue(new Error("stripe error"));

  const result = await expireStripeCheckoutSessions(paymentId, paymentCreatedAt);

  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalledWith(`Expiração das sessões do Stripe falhou. Pagamento: ${paymentId}`, expect.any(Error));
});
