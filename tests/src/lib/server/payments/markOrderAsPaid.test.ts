import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { markOrderAsPaid } from "@/lib/server";
import { recalculateUserBadges } from "@/lib/server/badges/achievementBadges";
import { getResend } from "@/lib/server/services/resend";
import { prisma } from "@/lib/server/services/prisma";
import { PaymentConfirmationEmail } from "@/shared/emails/PaymentConfirmationEmail";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

vi.mock("@/lib/server/badges/achievementBadges", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/badges/achievementBadges")>()),
  recalculateUserBadges: vi.fn(),
}));
vi.mock("@/lib/server/services/resend", () => ({ getResend: vi.fn() }));
vi.mock("@/shared/emails/PaymentConfirmationEmail", () => ({ PaymentConfirmationEmail: vi.fn() }));

const mockRecalculateUserBadges = recalculateUserBadges as unknown as Mock;
const mockGetResend = getResend as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockTicketPaymentFindUnique = prisma.ticketPayment.findUnique as unknown as Mock;
const mockTicketPaymentUpdateMany = prisma.ticketPayment.updateMany as unknown as Mock;
const mockTicketOrderUpdate = prisma.ticketOrder.update as unknown as Mock;
const mockVoucherPaymentFindUnique = prisma.voucherPayment.findUnique as unknown as Mock;
const mockVoucherPaymentUpdateMany = prisma.voucherPayment.updateMany as unknown as Mock;
const mockVoucherOrderUpdate = prisma.voucherOrder.update as unknown as Mock;
const mockSend = vi.fn();

/* - Funções e dados auxiliares - */

const now = new Date("2026-06-15T12:00:00.000Z");
const ticketPaymentId = "ticket-payment-1";
const voucherPaymentId = "voucher-payment-1";
const appUrl = "https://app.test";

// O mesmo registro serve para a transação e para a consulta do email, porque os dois usam o mesmo mock

const buildDatabaseTicketPayment = (overrides: Record<string, unknown> = {}) => ({
  id: ticketPaymentId,
  orderId: "ticket-order-1",
  userId: "user-1",
  status: "pending",
  method: "creditCard",
  totalValue: { toNumber: () => 50 },
  user: { name: "Ana", email: "ana@example.com" },
  order: { tickets: [{ quantity: 2, unitPrice: { toNumber: () => 25 }, event: { title: "Show de Rock" } }] },
  ...overrides,
});

const buildDatabaseVoucherPayment = (overrides: Record<string, unknown> = {}) => ({
  id: voucherPaymentId,
  orderId: "voucher-order-1",
  userId: "user-1",
  status: "pending",
  method: "debitCard",
  totalValue: { toNumber: () => 30 },
  user: { name: "Ana", email: "ana@example.com" },
  order: { vouchers: [{ quantity: 3, unitPrice: { toNumber: () => 10 }, product: { name: "Cerveja" } }] },
  ...overrides,
});

const realMethodCases = [
  ["a credit card payment paid with a debit card", "creditCard", "debitCard", { method: "debitCard" }],
  ["a debit card payment paid with a credit card", "debitCard", "creditCard", { method: "creditCard" }],
  ["a credit card payment paid with a credit card", "creditCard", "creditCard", { method: "creditCard" }],
  ["a payment that is not made by card", "cash", "creditCard", {}],
  ["a card payment when stripe does not inform the method", "creditCard", undefined, {}],
] as const;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);

  // A transação recebe o próprio prisma mockado como cliente, assim os mocks dos models valem dentro dela

  mockTransaction.mockImplementation(async (callback: (transaction: typeof prisma) => Promise<unknown>) => callback(prisma));

  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment());
  mockTicketPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockTicketOrderUpdate.mockResolvedValue({});
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment());
  mockVoucherPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherOrderUpdate.mockResolvedValue({});
  mockRecalculateUserBadges.mockResolvedValue({});
  mockGetResend.mockReturnValue({ emails: { send: mockSend } });
  mockSend.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

/* - Testando a chamada sem pagamentos - */

test("should return true and skip the queries, the email and the badges when no payment id is given", async () => {
  const result = await markOrderAsPaid({});

  expect(result).toBe(true);
  expect(mockTicketPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockVoucherPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

test("should confirm the payments inside a single transaction", async () => {
  await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(mockTransaction).toHaveBeenCalledTimes(1);
});

/* - Testando o pagamento dos ingressos: consulta ao banco - */

test("should look for the ticket payment by id", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockTicketPaymentFindUnique).toHaveBeenNthCalledWith(1, { where: { id: ticketPaymentId } });
});

test("should confirm the ticket payment only while it is still pending", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: ticketPaymentId, status: "pending" },
    data: { status: "confirmed", confirmedAt: now },
  });
});

test("should save the payment intent id in the ticket payment when it is given", async () => {
  await markOrderAsPaid({ ticketPaymentId, paymentIntentId: "pi_1" });

  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: ticketPaymentId, status: "pending" },
    data: { status: "confirmed", confirmedAt: now, paymentIntentId: "pi_1" },
  });
});

test.each(realMethodCases)(
  "should save the real method in the ticket payment for %s",
  async (_description, checkoutMethod, stripeMethod, expectedMethodData) => {
    mockTicketPaymentFindUnique.mockResolvedValueOnce(buildDatabaseTicketPayment({ method: checkoutMethod }));

    await markOrderAsPaid({ ticketPaymentId, stripeMethod: stripeMethod as never });

    expect(mockTicketPaymentUpdateMany).toHaveBeenCalledWith({
      where: { id: ticketPaymentId, status: "pending" },
      data: { status: "confirmed", confirmedAt: now, ...expectedMethodData },
    });
  },
);

test("should confirm the ticket order of the payment", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockTicketOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderUpdate).toHaveBeenCalledWith({ where: { id: "ticket-order-1" }, data: { status: "confirmed" } });
});

test("should not touch the vouchers when only the ticket payment id is given", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockVoucherPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos ingressos: pagamentos ignorados - */

test("should return true and skip everything when the ticket payment does not exist", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(null);

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

test.each([
  ["confirmed", "confirmed"],
  ["cancelled", "cancelled"],
  ["failed", "failed"],
])("should return true and skip everything when the ticket payment is %s", async (_description, status) => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment({ status }));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

test("should skip the order, the email and the badges when another webhook already confirmed the ticket payment", async () => {
  mockTicketPaymentUpdateMany.mockResolvedValue({ count: 0 });

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos vouchers: consulta ao banco - */

test("should look for the voucher payment by id", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  expect(mockVoucherPaymentFindUnique).toHaveBeenNthCalledWith(1, { where: { id: voucherPaymentId } });
});

test("should confirm the voucher payment only while it is still pending", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: voucherPaymentId, status: "pending" },
    data: { status: "confirmed", confirmedAt: now },
  });
});

test("should save the payment intent id in the voucher payment when it is given", async () => {
  await markOrderAsPaid({ voucherPaymentId, paymentIntentId: "pi_2" });

  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: voucherPaymentId, status: "pending" },
    data: { status: "confirmed", confirmedAt: now, paymentIntentId: "pi_2" },
  });
});

test.each(realMethodCases)(
  "should save the real method in the voucher payment for %s",
  async (_description, checkoutMethod, stripeMethod, expectedMethodData) => {
    mockVoucherPaymentFindUnique.mockResolvedValueOnce(buildDatabaseVoucherPayment({ method: checkoutMethod }));

    await markOrderAsPaid({ voucherPaymentId, stripeMethod: stripeMethod as never });

    expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledWith({
      where: { id: voucherPaymentId, status: "pending" },
      data: { status: "confirmed", confirmedAt: now, ...expectedMethodData },
    });
  },
);

test("should confirm the voucher order of the payment", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  expect(mockVoucherOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderUpdate).toHaveBeenCalledWith({ where: { id: "voucher-order-1" }, data: { status: "confirmed" } });
});

test("should not touch the tickets and should not recalculate the badges when only the voucher payment id is given", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  expect(mockTicketPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos vouchers: pagamentos ignorados - */

test("should return true and skip everything when the voucher payment does not exist", async () => {
  mockVoucherPaymentFindUnique.mockResolvedValue(null);

  const result = await markOrderAsPaid({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test.each([
  ["confirmed", "confirmed"],
  ["cancelled", "cancelled"],
  ["failed", "failed"],
])("should return true and skip everything when the voucher payment is %s", async (_description, status) => {
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment({ status }));

  const result = await markOrderAsPaid({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test("should skip the order and the email when another webhook already confirmed the voucher payment", async () => {
  mockVoucherPaymentUpdateMany.mockResolvedValue({ count: 0 });

  const result = await markOrderAsPaid({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando os dois pagamentos juntos - */

test("should confirm both the ticket payment and the voucher payment when both ids are given", async () => {
  const result = await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(result).toBe(true);
  expect(mockTicketOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderUpdate).toHaveBeenCalledTimes(1);
});

/* - Testando o email de pagamento confirmado - */

test("should look for the ticket payment with the user and the active tickets to build the email", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockTicketPaymentFindUnique).toHaveBeenCalledTimes(2);
  expect(mockTicketPaymentFindUnique).toHaveBeenNthCalledWith(2, {
    where: { id: ticketPaymentId },
    include: { user: true, order: { include: { tickets: { where: { status: "active" }, include: { event: true } } } } },
  });
});

test("should send the email of the ticket payment to the user", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockSend).toHaveBeenCalledTimes(1);

  const [emailArgs] = mockSend.mock.calls[0];

  expect(emailArgs).toEqual(
    expect.objectContaining({
      from: "Prisma Hall <naoresponda@prismahall.com>",
      to: "ana@example.com",
      subject: "Pagamento confirmado no Prisma Hall",
      text: `Olá, Ana! O pagamento do seu pedido foi confirmado. Acesse ${appUrl}/pedidos/ticket-order-1 para ver os detalhes.`,
    }),
  );
  expect(emailArgs.react.type).toBe(PaymentConfirmationEmail);
  expect(emailArgs.react.props).toEqual({
    name: "Ana",
    link: `${appUrl}/pedidos/ticket-order-1`,
    totalValue: 50,
    method: "creditCard",
    items: [{ type: "tickets", name: "Show de Rock", quantity: 2, unitPrice: 25 }],
  });
});

test("should look for the voucher payment with the user and the active vouchers to build the email", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledTimes(2);
  expect(mockVoucherPaymentFindUnique).toHaveBeenNthCalledWith(2, {
    where: { id: voucherPaymentId },
    include: { user: true, order: { include: { vouchers: { where: { status: "active" }, include: { product: true } } } } },
  });
});

test("should send the email of the voucher payment with the drinks and the link of the voucher order", async () => {
  await markOrderAsPaid({ voucherPaymentId });

  const [emailArgs] = mockSend.mock.calls[0];

  expect(emailArgs.to).toBe("ana@example.com");
  expect(emailArgs.react.props).toEqual({
    name: "Ana",
    link: `${appUrl}/pedidos/voucher-order-1`,
    totalValue: 30,
    method: "debitCard",
    items: [{ type: "drinks", name: "Cerveja", quantity: 3, unitPrice: 10 }],
  });
});

test("should send a single email with the sum of both payments, using the ticket data first", async () => {
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment({ user: { name: "Bruno", email: "bruno@example.com" } }));

  await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(mockSend).toHaveBeenCalledTimes(1);

  const [emailArgs] = mockSend.mock.calls[0];

  expect(emailArgs.to).toBe("ana@example.com");
  expect(emailArgs.react.props).toEqual({
    name: "Ana",
    link: `${appUrl}/pedidos/ticket-order-1`,
    totalValue: 80,
    method: "creditCard",
    items: [
      { type: "tickets", name: "Show de Rock", quantity: 2, unitPrice: 25 },
      { type: "drinks", name: "Cerveja", quantity: 3, unitPrice: 10 },
    ],
  });
});

test("should round the total value of the email to two decimal places", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment({ totalValue: { toNumber: () => 10.1 } }));
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment({ totalValue: { toNumber: () => 20.2 } }));

  await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(mockSend.mock.calls[0][0].react.props.totalValue).toBe(30.3);
});

test("should send the email only for the payment that was confirmed now", async () => {
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment({ status: "confirmed" }));

  await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledTimes(1);
  expect(mockSend.mock.calls[0][0].react.props.items).toEqual([{ type: "tickets", name: "Show de Rock", quantity: 2, unitPrice: 25 }]);
});

test("should skip the email when the payment is not found while building it", async () => {
  mockTicketPaymentFindUnique.mockResolvedValueOnce(buildDatabaseTicketPayment()).mockResolvedValueOnce(null);

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockSend).not.toHaveBeenCalled();
});

test("should skip the email when the order has no active items", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment({ order: { tickets: [] } }));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando os badges - */

test("should recalculate the badges of the user that bought the tickets", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockRecalculateUserBadges).toHaveBeenCalledTimes(1);
  expect(mockRecalculateUserBadges).toHaveBeenCalledWith("user-1");
});

test("should send the email before recalculating the badges", async () => {
  await markOrderAsPaid({ ticketPaymentId });

  expect(mockSend.mock.invocationCallOrder[0]).toBeLessThan(mockRecalculateUserBadges.mock.invocationCallOrder[0]);
});

/* - Testando o resultado - */

test("should return true when the payments are confirmed", async () => {
  const result = await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(result).toBe(true);
});

/* - Testando as falhas do email - */

test("should return true and still recalculate the badges when the email fails to send", async () => {
  mockSend.mockRejectedValue(new Error("resend error"));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockRecalculateUserBadges).toHaveBeenCalledTimes(1);
});

test("should return true when the email provider cannot be created", async () => {
  mockGetResend.mockImplementation(() => {
    throw new Error("missing api key");
  });

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockRecalculateUserBadges).toHaveBeenCalledTimes(1);
});

test("should return true when the database fails while building the email", async () => {
  mockTicketPaymentFindUnique.mockResolvedValueOnce(buildDatabaseTicketPayment()).mockRejectedValueOnce(new Error("db error"));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando as falhas do banco - */

test("should return false and skip the email and the badges when the transaction fails", async () => {
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await markOrderAsPaid({ ticketPaymentId, voucherPaymentId });

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
  expect(mockRecalculateUserBadges).not.toHaveBeenCalled();
});

test.each([
  ["looking for the ticket payment", () => mockTicketPaymentFindUnique],
  ["confirming the ticket payment", () => mockTicketPaymentUpdateMany],
  ["confirming the ticket order", () => mockTicketOrderUpdate],
])("should return false and skip the email when the database fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
});

test.each([
  ["looking for the voucher payment", () => mockVoucherPaymentFindUnique],
  ["confirming the voucher payment", () => mockVoucherPaymentUpdateMany],
  ["confirming the voucher order", () => mockVoucherOrderUpdate],
])("should return false and skip the email when the database fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await markOrderAsPaid({ voucherPaymentId });

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
});

test("should return false when recalculating the badges throws, after the email was already sent", async () => {
  mockRecalculateUserBadges.mockRejectedValue(new Error("badge error"));

  const result = await markOrderAsPaid({ ticketPaymentId });

  expect(result).toBe(false);
  expect(mockSend).toHaveBeenCalledTimes(1);
});
