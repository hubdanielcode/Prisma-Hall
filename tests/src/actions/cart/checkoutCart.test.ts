import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { checkoutCart } from "@/actions/cart/checkoutCart";
import { getResend } from "@/lib/server";
import { OrderConfirmationEmail } from "@/shared/emails/OrderConfirmationEmail";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus, getResend: vi.fn() };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockGetResend = getResend as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockSend = vi.fn();

// O client que a transaction recebe no callback. Cada método é um mock separado para o teste conferir o que foi chamado dentro dela

const mockCartFindMany = vi.fn();
const mockCartDeleteMany = vi.fn();
const mockTicketOrderCreate = vi.fn();
const mockVoucherOrderCreate = vi.fn();
const mockProductUpdateMany = vi.fn();

const transactionClient = {
  cart: { findMany: mockCartFindMany, deleteMany: mockCartDeleteMany },
  ticketOrder: { create: mockTicketOrderCreate },
  voucherOrder: { create: mockVoucherOrderCreate },
  product: { updateMany: mockProductUpdateMany },
};

/* - Funções e dados auxiliares - */

type CheckoutCartInput = Parameters<typeof checkoutCart>[0];

const appUrl = "https://prismahall.com";
const productId = "550e8400-e29b-41d4-a716-446655440000";
const eventId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price do Prisma é um Decimal, por isso os mocks têm o método toNumber (o mesmo objeto é reaproveitado para comparar o unitPrice enviado ao banco)

const productPrice = { toNumber: () => 12.5 };
const eventPrice = { toNumber: () => 50 };

const buildCartTicket = (overrides: Record<string, unknown> = {}) => ({
  id: "cart 1",
  userId: "user 1",
  type: "tickets",
  quantity: 2,
  product: null,

  event: {
    id: eventId,
    title: "Rock na Praça",
    isCancelled: false,
    price: eventPrice,
    startsAt: futureStartsAt,
  },

  ...overrides,
});

const buildCartDrink = (overrides: Record<string, unknown> = {}) => ({
  id: "cart 2",
  userId: "user 1",
  type: "drinks",
  quantity: 3,
  event: null,

  product: {
    id: productId,
    name: "Heineken",
    status: "active",
    price: productPrice,
  },

  ...overrides,
});

// Ingressos: 2 x 50 = 100, mais 10% de taxa = 110. Bebidas: 3 x 12,5 = 37,5, mais 10% de taxa = 41,25. Total: 151,25

const expectedTicketItem = { type: "tickets", name: "Rock na Praça", quantity: 2, unitPrice: 50 };
const expectedDrinkItem = { type: "drinks", name: "Heineken", quantity: 3, unitPrice: 12.5 };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockTransaction.mockImplementation(async (callback: (client: typeof transactionClient) => unknown) => callback(transactionClient));
  mockCartFindMany.mockResolvedValue([buildCartTicket(), buildCartDrink()]);
  mockCartDeleteMany.mockResolvedValue({ count: 2 });
  mockTicketOrderCreate.mockResolvedValue({ id: "ticket order 1", ticketPayments: [{ id: "ticket payment 1" }] });
  mockVoucherOrderCreate.mockResolvedValue({ id: "voucher order 1", voucherPayments: [{ id: "voucher payment 1" }] });
  mockProductUpdateMany.mockResolvedValue({ count: 1 });
  mockGetResend.mockReturnValue({ emails: { send: mockSend } });
  mockSend.mockResolvedValue({ data: { id: "email 1" }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the transaction and the e-mail when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test.each([
  ["an empty payment method", ""],
  ["an unknown payment method", "boleto"],
  ["a payment method with different casing", "PIX"],
])("should return false and skip the transaction and the e-mail when the input has %s", async (_description, invalidPayment) => {
  const result = await checkoutCart(invalidPayment as CheckoutCartInput);

  expect(result).toBe(false);
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando o carrinho - */

test("should look for the cart items of the user with their product and event", async () => {
  await checkoutCart("pix");

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockCartFindMany).toHaveBeenCalledWith({ where: { userId: "user 1" }, include: { product: true, event: true } });
});

test("should return false and create nothing when the cart is empty", async () => {
  mockCartFindMany.mockResolvedValue([]);

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockTicketOrderCreate).not.toHaveBeenCalled();
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
  expect(mockCartDeleteMany).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando o pedido de ingressos - */

test("should create the ticket order with the tickets and the pending payment including the service fee", async () => {
  mockCartFindMany.mockResolvedValue([buildCartTicket()]);

  await checkoutCart("pix");

  expect(mockTicketOrderCreate).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderCreate).toHaveBeenCalledWith({
    data: {
      userId: "user 1",
      status: "pending",

      tickets: { create: [{ userId: "user 1", eventId, quantity: 2, unitPrice: eventPrice }] },

      ticketPayments: { create: { userId: "user 1", method: "pix", status: "pending", totalValue: 110 } },
    },

    include: { ticketPayments: true },
  });
});

test.each(["cash", "pix", "debitCard", "creditCard"] as const)("should create the payment with the %s method", async (method) => {
  mockCartFindMany.mockResolvedValue([buildCartTicket(), buildCartDrink()]);

  await checkoutCart(method);

  expect(mockTicketOrderCreate.mock.calls[0][0].data.ticketPayments.create.method).toBe(method);
  expect(mockVoucherOrderCreate.mock.calls[0][0].data.voucherPayments.create.method).toBe(method);
});

test("should create a single ticket order with a ticket for each event and sum all of them in the payment", async () => {
  const otherEventId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const otherEventPrice = { toNumber: () => 30 };

  mockCartFindMany.mockResolvedValue([
    buildCartTicket({ quantity: 2 }),
    buildCartTicket({
      id: "cart 3",
      quantity: 1,
      event: { id: otherEventId, title: "Jazz na Praça", isCancelled: false, price: otherEventPrice, startsAt: futureStartsAt },
    }),
  ]);

  await checkoutCart("pix");

  // 2 x 50 + 1 x 30 = 130, mais 10% de taxa = 143

  expect(mockTicketOrderCreate).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderCreate.mock.calls[0][0].data.tickets.create).toEqual([
    { userId: "user 1", eventId, quantity: 2, unitPrice: eventPrice },
    { userId: "user 1", eventId: otherEventId, quantity: 1, unitPrice: otherEventPrice },
  ]);
  expect(mockTicketOrderCreate.mock.calls[0][0].data.ticketPayments.create.totalValue).toBe(143);
});

test.each([
  ["the event does not exist anymore", null],
  ["the event already happened", { id: eventId, title: "Rock na Praça", isCancelled: false, price: eventPrice, startsAt: pastStartsAt }],
  ["the event is cancelled", { id: eventId, title: "Rock na Praça", isCancelled: true, price: eventPrice, startsAt: futureStartsAt }],
])("should return false and create nothing when %s", async (_description, event) => {
  mockCartFindMany.mockResolvedValue([buildCartTicket({ event })]);

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockTicketOrderCreate).not.toHaveBeenCalled();
  expect(mockCartDeleteMany).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test("should return false and create nothing when one of the events is unavailable among available ones", async () => {
  mockCartFindMany.mockResolvedValue([buildCartTicket(), buildCartTicket({ id: "cart 3", event: null }), buildCartDrink()]);

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockTicketOrderCreate).not.toHaveBeenCalled();
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando o pedido de vouchers - */

test("should create the voucher order with the vouchers and the pending payment including the service fee", async () => {
  mockCartFindMany.mockResolvedValue([buildCartDrink()]);

  await checkoutCart("pix");

  expect(mockVoucherOrderCreate).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderCreate).toHaveBeenCalledWith({
    data: {
      userId: "user 1",
      status: "pending",

      vouchers: { create: [{ userId: "user 1", productId, quantity: 3, unitPrice: productPrice }] },

      voucherPayments: { create: { userId: "user 1", method: "pix", status: "pending", totalValue: 41.25 } },
    },

    include: { voucherPayments: true },
  });
});

test("should round the payment with the service fee to cents", async () => {
  mockCartFindMany.mockResolvedValue([
    buildCartDrink({ quantity: 1, product: { id: productId, name: "Água", status: "active", price: { toNumber: () => 3.33 } } }),
  ]);

  await checkoutCart("pix");

  // 3,33 + 10% de taxa = 3,663, que arredonda para 3,66

  expect(mockVoucherOrderCreate.mock.calls[0][0].data.voucherPayments.create.totalValue).toBe(3.66);
});

test("should decrease the stock of each drink only when there is enough quantity", async () => {
  const otherProductId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  mockCartFindMany.mockResolvedValue([
    buildCartDrink({ quantity: 3 }),
    buildCartDrink({ id: "cart 3", quantity: 1, product: { id: otherProductId, name: "Corona", status: "active", price: productPrice } }),
  ]);

  await checkoutCart("pix");

  expect(mockProductUpdateMany).toHaveBeenCalledTimes(2);
  expect(mockProductUpdateMany).toHaveBeenNthCalledWith(1, { where: { id: productId, quantity: { gte: 3 } }, data: { quantity: { decrement: 3 } } });
  expect(mockProductUpdateMany).toHaveBeenNthCalledWith(2, {
    where: { id: otherProductId, quantity: { gte: 1 } },
    data: { quantity: { decrement: 1 } },
  });
});

test("should decrease the stock before creating the voucher order", async () => {
  mockCartFindMany.mockResolvedValue([buildCartDrink()]);

  await checkoutCart("pix");

  expect(mockProductUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(mockVoucherOrderCreate.mock.invocationCallOrder[0]);
});

test("should return false and skip the voucher order when there is not enough stock", async () => {
  mockCartFindMany.mockResolvedValue([buildCartDrink()]);
  mockProductUpdateMany.mockResolvedValue({ count: 0 });

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
  expect(mockCartDeleteMany).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test.each([
  ["the product does not exist anymore", null],
  ["the product is not active", { id: productId, name: "Heineken", status: "inactive", price: productPrice }],
])("should return false and skip the stock and the voucher order when %s", async (_description, product) => {
  mockCartFindMany.mockResolvedValue([buildCartDrink({ product })]);

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockProductUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando o resultado - */

test("should return the ids of the orders and of the payments when the cart has tickets and drinks", async () => {
  const result = await checkoutCart("pix");

  expect(result).toEqual({
    ticketOrderId: "ticket order 1",
    ticketPaymentId: "ticket payment 1",
    voucherOrderId: "voucher order 1",
    voucherPaymentId: "voucher payment 1",
  });
});

test("should return only the ticket ids and skip the voucher order when the cart has only tickets", async () => {
  mockCartFindMany.mockResolvedValue([buildCartTicket()]);

  const result = await checkoutCart("pix");

  expect(result).toEqual({ ticketOrderId: "ticket order 1", ticketPaymentId: "ticket payment 1", voucherOrderId: null, voucherPaymentId: undefined });
  expect(mockVoucherOrderCreate).not.toHaveBeenCalled();
  expect(mockProductUpdateMany).not.toHaveBeenCalled();
});

test("should return only the voucher ids and skip the ticket order when the cart has only drinks", async () => {
  mockCartFindMany.mockResolvedValue([buildCartDrink()]);

  const result = await checkoutCart("pix");

  expect(result).toEqual({
    ticketOrderId: null,
    ticketPaymentId: undefined,
    voucherOrderId: "voucher order 1",
    voucherPaymentId: "voucher payment 1",
  });
  expect(mockTicketOrderCreate).not.toHaveBeenCalled();
});

/* - Testando a limpeza do carrinho - */

test("should clear the cart of the user only after creating the orders", async () => {
  await checkoutCart("pix");

  expect(mockCartDeleteMany).toHaveBeenCalledTimes(1);
  expect(mockCartDeleteMany).toHaveBeenCalledWith({ where: { userId: "user 1" } });
  expect(mockTicketOrderCreate.mock.invocationCallOrder[0]).toBeLessThan(mockCartDeleteMany.mock.invocationCallOrder[0]);
  expect(mockVoucherOrderCreate.mock.invocationCallOrder[0]).toBeLessThan(mockCartDeleteMany.mock.invocationCallOrder[0]);
});

/* - Testando o e-mail de confirmação - */

test("should send the confirmation e-mail to the user with the items and the total value of both orders", async () => {
  await checkoutCart("pix");

  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend).toHaveBeenCalledWith({
    from: "Prisma Hall <naoresponda@prismahall.com>",
    to: "maria@gmail.com",
    subject: "Recebemos o seu pedido no Prisma Hall",
    text: expect.stringContaining(`${appUrl}/perfil`),

    react: expect.objectContaining({
      type: OrderConfirmationEmail,
      props: {
        name: "Maria Silva",
        link: `${appUrl}/pedidos/ticket order 1`,
        totalValue: 151.25,
        items: [expectedTicketItem, expectedDrinkItem],
      },
    }),
  });
});

test("should link the e-mail to the ticket order page when the cart has tickets", async () => {
  mockCartFindMany.mockResolvedValue([buildCartTicket()]);

  await checkoutCart("pix");

  expect(mockSend.mock.calls[0][0].react.props.link).toBe(`${appUrl}/pedidos/ticket order 1`);
  expect(mockSend.mock.calls[0][0].react.props).toMatchObject({ totalValue: 110, items: [expectedTicketItem] });
});

test("should link the e-mail to the profile page when the cart has only drinks", async () => {
  mockCartFindMany.mockResolvedValue([buildCartDrink()]);

  await checkoutCart("pix");

  expect(mockSend.mock.calls[0][0].react.props.link).toBe(`${appUrl}/perfil`);
  expect(mockSend.mock.calls[0][0].react.props).toMatchObject({ totalValue: 41.25, items: [expectedDrinkItem] });
});

test("should send the e-mail only after the transaction", async () => {
  await checkoutCart("pix");

  expect(mockTransaction.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
});

test.each([
  ["the e-mail provider fails", () => mockSend.mockRejectedValue(new Error("e-mail error"))],
  [
    "the e-mail client cannot be created",
    () =>
      mockGetResend.mockImplementation(() => {
        throw new Error("config error");
      }),
  ],
])("should still return the ids of the orders when %s", async (_description, setupFailure) => {
  setupFailure();

  const result = await checkoutCart("pix");

  expect(result).toEqual({
    ticketOrderId: "ticket order 1",
    ticketPaymentId: "ticket payment 1",
    voucherOrderId: "voucher order 1",
    voucherPaymentId: "voucher payment 1",
  });
});

/* - Testando as falhas do banco - */

test("should return false and skip the e-mail when the transaction fails", async () => {
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
});

test.each([
  ["looking for the cart items", () => mockCartFindMany],
  ["creating the ticket order", () => mockTicketOrderCreate],
  ["decreasing the stock", () => mockProductUpdateMany],
  ["creating the voucher order", () => mockVoucherOrderCreate],
  ["clearing the cart", () => mockCartDeleteMany],
])("should return false and skip the e-mail when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await checkoutCart("pix");

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
});
