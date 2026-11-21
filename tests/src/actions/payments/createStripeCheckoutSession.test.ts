import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { createStripeCheckoutSession } from "@/actions/payments/createStripeCheckoutSession";
import { prisma } from "@/lib/server/services/prisma";
import { stripe } from "@/lib/server";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return { prisma, stripe: { checkout: { sessions: { create: vi.fn() } } } };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockCreateStripeSession = stripe.checkout.sessions.create as unknown as Mock;
const mockFindUniqueTicketPayment = prisma.ticketPayment.findUnique as unknown as Mock;
const mockFindUniqueVoucherPayment = prisma.voucherPayment.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

type CreateStripeCheckoutSessionInput = Parameters<typeof createStripeCheckoutSession>[0];

const appUrl = "https://prismahall.com";
const ticketPaymentId = "550e8400-e29b-41d4-a716-446655440000";
const voucherPaymentId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const now = new Date("2026-01-15T18:00:00.000Z");
const checkoutUrl = "https://checkout.stripe.com/c/pay/cs_test_123";

const buildInput = (overrides: Partial<CreateStripeCheckoutSessionInput> = {}): CreateStripeCheckoutSessionInput => ({
  ticketPaymentId,
  voucherPaymentId,
  ...overrides,
});

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O totalValue do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDatabasePayment = (overrides: Record<string, unknown> = {}) => ({
  id: ticketPaymentId,
  userId: "user 1",
  orderId: "ticket order 1",
  method: "pix",
  status: "pending",
  totalValue: { toNumber: () => 110 },
  ...overrides,
});

const buildDatabaseVoucherPayment = (overrides: Record<string, unknown> = {}) =>
  buildDatabasePayment({ id: voucherPaymentId, orderId: "voucher order 1", totalValue: { toNumber: () => 41.25 }, ...overrides });

const ticketLineItem = { quantity: 1, price_data: { currency: "brl", unit_amount: 11000, product_data: { name: "Ingressos" } } };
const voucherLineItem = { quantity: 1, price_data: { currency: "brl", unit_amount: 4125, product_data: { name: "Pedidos" } } };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment());
  mockFindUniqueVoucherPayment.mockResolvedValue(buildDatabaseVoucherPayment());
  mockCreateStripeSession.mockResolvedValue({ url: checkoutUrl });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database and the stripe when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await createStripeCheckoutSession(buildInput());

  expect(result).toBe(false);
  expect(mockFindUniqueTicketPayment).not.toHaveBeenCalled();
  expect(mockFindUniqueVoucherPayment).not.toHaveBeenCalled();
  expect(mockCreateStripeSession).not.toHaveBeenCalled();
});

test.each([
  ["a ticket payment id that is not a uuid", { ticketPaymentId: "not-a-uuid" }],
  ["a voucher payment id that is not a uuid", { voucherPaymentId: "not-a-uuid" }],
])("should return false and skip the database and the stripe when the input has %s", async (_description, invalidInput) => {
  const result = await createStripeCheckoutSession(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockFindUniqueTicketPayment).not.toHaveBeenCalled();
  expect(mockFindUniqueVoucherPayment).not.toHaveBeenCalled();
  expect(mockCreateStripeSession).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for both payments by their ids", async () => {
  await createStripeCheckoutSession(buildInput());

  expect(mockFindUniqueTicketPayment).toHaveBeenCalledWith({ where: { id: ticketPaymentId } });
  expect(mockFindUniqueVoucherPayment).toHaveBeenCalledWith({ where: { id: voucherPaymentId } });
});

test("should look only for the payment that came in the input", async () => {
  await createStripeCheckoutSession({ ticketPaymentId });

  expect(mockFindUniqueTicketPayment).toHaveBeenCalledTimes(1);
  expect(mockFindUniqueVoucherPayment).not.toHaveBeenCalled();

  await createStripeCheckoutSession({ voucherPaymentId });

  expect(mockFindUniqueTicketPayment).toHaveBeenCalledTimes(1);
  expect(mockFindUniqueVoucherPayment).toHaveBeenCalledTimes(1);
});

/* - Testando os pagamentos que podem ser cobrados - */

test("should return false and skip the stripe when the input has no payment", async () => {
  const result = await createStripeCheckoutSession({});

  expect(result).toBe(false);
  expect(mockCreateStripeSession).not.toHaveBeenCalled();
});

test.each([
  ["does not exist", null],
  ["belongs to another user", buildDatabasePayment({ userId: "user 2" })],
  ["is already confirmed", buildDatabasePayment({ status: "confirmed" })],
  ["is cancelled", buildDatabasePayment({ status: "cancelled" })],
  ["is paid in cash", buildDatabasePayment({ method: "cash" })],
])("should return false and skip the stripe when the only payment %s", async (_description, payment) => {
  mockFindUniqueTicketPayment.mockResolvedValue(payment);

  const result = await createStripeCheckoutSession({ ticketPaymentId });

  expect(result).toBe(false);
  expect(mockCreateStripeSession).not.toHaveBeenCalled();
});

test("should charge only the valid payment when the other one cannot be charged", async () => {
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment({ userId: "user 2" }));

  await createStripeCheckoutSession(buildInput());

  const stripeParams = mockCreateStripeSession.mock.calls[0][0];

  expect(stripeParams.line_items).toEqual([voucherLineItem]);
  expect(stripeParams.metadata).toEqual({ ticketPaymentId: "", voucherPaymentId });
  expect(stripeParams.success_url).toBe(`${appUrl}/pedidos/voucher order 1`);
});

/* - Testando os itens da cobrança - */

test("should charge the tickets as a single item in cents", async () => {
  await createStripeCheckoutSession({ ticketPaymentId });

  expect(mockCreateStripeSession.mock.calls[0][0].line_items).toEqual([ticketLineItem]);
});

test("should charge the vouchers as a single item in cents", async () => {
  await createStripeCheckoutSession({ voucherPaymentId });

  expect(mockCreateStripeSession.mock.calls[0][0].line_items).toEqual([voucherLineItem]);
});

test("should charge the tickets before the vouchers when both payments are valid", async () => {
  await createStripeCheckoutSession(buildInput());

  expect(mockCreateStripeSession.mock.calls[0][0].line_items).toEqual([ticketLineItem, voucherLineItem]);
});

test.each([
  [110, 11000],
  [19.99, 1999],
  [0.1, 10],
  [1.006, 101],
])("should round the value %f to %i cents", async (totalValue, expectedAmount) => {
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment({ totalValue: { toNumber: () => totalValue } }));

  await createStripeCheckoutSession({ ticketPaymentId });

  expect(mockCreateStripeSession.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(expectedAmount);
});

/* - Testando os métodos de pagamento aceitos - */

test.each([
  ["pix", "pix", ["pix"]],
  ["credit card", "creditCard", ["card"]],
  ["debit card", "debitCard", ["card"]],
])("should accept only the %s method of the payment on the stripe", async (_description, method, expectedTypes) => {
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment({ method }));

  await createStripeCheckoutSession({ ticketPaymentId });

  expect(mockCreateStripeSession.mock.calls[0][0].allowed_payment_method_types).toEqual(expectedTypes);
});

test.each([
  ["pix and credit card", "pix", "creditCard", ["pix", "card"]],
  ["credit card and pix", "creditCard", "pix", ["card", "pix"]],
  ["credit card and debit card", "creditCard", "debitCard", ["card"]],
  ["pix and pix", "pix", "pix", ["pix"]],
])("should accept the methods without repeating when the payments are %s", async (_description, ticketMethod, voucherMethod, expectedTypes) => {
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment({ method: ticketMethod }));
  mockFindUniqueVoucherPayment.mockResolvedValue(buildDatabaseVoucherPayment({ method: voucherMethod }));

  await createStripeCheckoutSession(buildInput());

  expect(mockCreateStripeSession.mock.calls[0][0].allowed_payment_method_types).toEqual(expectedTypes);
});

test("should ignore a payment in cash and charge only the other one", async () => {
  mockFindUniqueTicketPayment.mockResolvedValue(buildDatabasePayment({ method: "cash" }));
  mockFindUniqueVoucherPayment.mockResolvedValue(buildDatabaseVoucherPayment({ method: "pix" }));

  await createStripeCheckoutSession(buildInput());

  const stripeParams = mockCreateStripeSession.mock.calls[0][0];

  expect(stripeParams.line_items).toEqual([voucherLineItem]);
  expect(stripeParams.allowed_payment_method_types).toEqual(["pix"]);
});

/* - Testando a sessão de pagamento - */

test("should create the payment session with the e-mail of the user, the return urls, the expiration and the metadata", async () => {
  await createStripeCheckoutSession(buildInput());

  const metadata = { ticketPaymentId, voucherPaymentId };

  expect(mockCreateStripeSession).toHaveBeenCalledTimes(1);
  expect(mockCreateStripeSession).toHaveBeenCalledWith({
    mode: "payment",
    customer_email: "maria@gmail.com",
    line_items: [ticketLineItem, voucherLineItem],
    allowed_payment_method_types: ["pix"],
    success_url: `${appUrl}/pedidos/ticket order 1`,
    cancel_url: `${appUrl}/pedidos/ticket order 1`,
    expires_at: Math.floor(now.getTime() / 1000) + 60 * 60,
    metadata,
    payment_intent_data: { metadata },
  });
});

test("should return to the ticket order page when the payments are for tickets and vouchers", async () => {
  await createStripeCheckoutSession(buildInput());

  const stripeParams = mockCreateStripeSession.mock.calls[0][0];

  expect(stripeParams.success_url).toBe(`${appUrl}/pedidos/ticket order 1`);
  expect(stripeParams.cancel_url).toBe(`${appUrl}/pedidos/ticket order 1`);
});

test("should return to the voucher order page when there is only a voucher payment", async () => {
  await createStripeCheckoutSession({ voucherPaymentId });

  const stripeParams = mockCreateStripeSession.mock.calls[0][0];

  expect(stripeParams.success_url).toBe(`${appUrl}/pedidos/voucher order 1`);
  expect(stripeParams.cancel_url).toBe(`${appUrl}/pedidos/voucher order 1`);
});

test("should send an empty id in the metadata for the payment that is not being charged", async () => {
  await createStripeCheckoutSession({ ticketPaymentId });

  const stripeParams = mockCreateStripeSession.mock.calls[0][0];

  expect(stripeParams.metadata).toEqual({ ticketPaymentId, voucherPaymentId: "" });
  expect(stripeParams.payment_intent_data).toEqual({ metadata: { ticketPaymentId, voucherPaymentId: "" } });
});

/* - Testando o resultado - */

test("should return the url of the payment session", async () => {
  const result = await createStripeCheckoutSession(buildInput());

  expect(result).toBe(checkoutUrl);
});

test("should return false when the payment session has no url", async () => {
  mockCreateStripeSession.mockResolvedValue({ url: null });

  const result = await createStripeCheckoutSession(buildInput());

  expect(result).toBe(false);
});

/* - Testando as falhas - */

test.each([
  ["looking for the ticket payment", () => mockFindUniqueTicketPayment],
  ["looking for the voucher payment", () => mockFindUniqueVoucherPayment],
  ["creating the payment session", () => mockCreateStripeSession],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await createStripeCheckoutSession(buildInput());

  expect(result).toBe(false);
});
