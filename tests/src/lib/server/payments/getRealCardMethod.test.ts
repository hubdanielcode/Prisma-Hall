import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getRealCardMethod } from "@/lib/server";
import { stripe } from "@/lib/server/services/stripe";

/* - Mocks das dependências externas - */

vi.mock("@/lib/server/services/stripe", () => ({
  stripe: { paymentIntents: { retrieve: vi.fn() } },
}));

const mockPaymentIntentsRetrieve = stripe.paymentIntents.retrieve as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildCheckoutSession = (overrides: Record<string, unknown> = {}) =>
  ({
    allowed_payment_method_types: ["card"],
    payment_intent: "pi_1",
    ...overrides,
  }) as never;

const buildPaymentIntent = (funding?: string) => ({
  latest_charge: { payment_method_details: { card: { funding } } },
});

beforeEach(() => {
  mockPaymentIntentsRetrieve.mockResolvedValue(buildPaymentIntent("credit"));
});

/* - Testando as sessões sem cartão - */

test.each([
  ["only pix", { allowed_payment_method_types: ["pix"] }],
  ["no allowed payment method types", { allowed_payment_method_types: undefined }],
  ["an empty list of allowed payment method types", { allowed_payment_method_types: [] }],
])("should return undefined and skip stripe when the session has %s", async (_description, overrides) => {
  const result = await getRealCardMethod(buildCheckoutSession(overrides));

  expect(result).toBeUndefined();
  expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
});

test.each([
  ["null", null],
  ["undefined", undefined],
])("should return undefined and skip stripe when the payment intent is %s", async (_description, paymentIntent) => {
  const result = await getRealCardMethod(buildCheckoutSession({ payment_intent: paymentIntent }));

  expect(result).toBeUndefined();
  expect(mockPaymentIntentsRetrieve).not.toHaveBeenCalled();
});

/* - Testando a consulta ao Stripe - */

test("should retrieve the payment intent with the latest charge when the id comes as a string", async () => {
  await getRealCardMethod(buildCheckoutSession({ payment_intent: "pi_string" }));

  expect(mockPaymentIntentsRetrieve).toHaveBeenCalledTimes(1);
  expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith("pi_string", { expand: ["latest_charge"] });
});

test("should retrieve the payment intent by the id when the session brings the payment intent as an object", async () => {
  await getRealCardMethod(buildCheckoutSession({ payment_intent: { id: "pi_object" } }));

  expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith("pi_object", { expand: ["latest_charge"] });
});

/* - Testando o resultado - */

test.each([
  ["credit", "creditCard"],
  ["debit", "debitCard"],
])("should return %s card method according to the funding of the card", async (funding, expectedMethod) => {
  mockPaymentIntentsRetrieve.mockResolvedValue(buildPaymentIntent(funding));

  const result = await getRealCardMethod(buildCheckoutSession());

  expect(result).toBe(expectedMethod);
});

test.each([
  ["a prepaid card", buildPaymentIntent("prepaid")],
  ["an unknown funding", buildPaymentIntent("unknown")],
  ["no funding", buildPaymentIntent(undefined)],
  ["no card details", { latest_charge: { payment_method_details: {} } }],
  ["no payment method details", { latest_charge: {} }],
  ["no latest charge", { latest_charge: null }],
  ["a latest charge that was not expanded", { latest_charge: "ch_1" }],
])("should return undefined when the payment intent has %s", async (_description, paymentIntent) => {
  mockPaymentIntentsRetrieve.mockResolvedValue(paymentIntent);

  const result = await getRealCardMethod(buildCheckoutSession());

  expect(result).toBeUndefined();
});

/* - Testando as falhas do Stripe - */

test("should return undefined when stripe fails", async () => {
  mockPaymentIntentsRetrieve.mockRejectedValue(new Error("stripe error"));

  const result = await getRealCardMethod(buildCheckoutSession());

  expect(result).toBeUndefined();
});
