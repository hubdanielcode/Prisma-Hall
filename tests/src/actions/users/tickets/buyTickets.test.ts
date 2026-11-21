import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { buyTickets } from "@/actions/users/tickets/buyTickets";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus continua o real) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUniqueEvent = prisma.event.findUnique as unknown as Mock;
const mockCreateTicketOrder = prisma.ticketOrder.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type BuyTicketsInput = Parameters<typeof buyTickets>[0];

const eventId = "550e8400-e29b-41d4-a716-446655440000";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");
const createdAt = new Date("2026-01-15T18:00:00.000Z");
const updatedAt = new Date("2026-01-16T09:30:00.000Z");

const buildInput = (overrides: Record<string, unknown> = {}) => ({ eventId, quantity: 2, method: "pix", ...overrides }) as unknown as BuyTicketsInput;

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price, o unitPrice e o totalValue do Prisma são Decimal, por isso os mocks têm o método toNumber (o mesmo objeto é reaproveitado para comparar o unitPrice enviado ao banco)

const eventPrice = { toNumber: () => 50 };

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  isCancelled: false,
  price: eventPrice,
  startsAt: futureStartsAt,
  ...overrides,
});

const buildDatabaseOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "order 1",
  status: "pending",
  tickets: [{ eventId, quantity: 2, unitPrice: { toNumber: () => 50 } }],
  ticketPayments: [{ method: "pix", status: "pending", totalValue: { toNumber: () => 100 } }],
  createdAt,
  updatedAt,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent());
  mockCreateTicketOrder.mockResolvedValue(buildDatabaseOrder());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await buyTickets(buildInput());

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateTicketOrder).not.toHaveBeenCalled();
});

test.each([
  ["an event id that is not a uuid", { eventId: "not-a-uuid" }],
  ["a quantity of zero", { quantity: 0 }],
  ["a negative quantity", { quantity: -1 }],
  ["a quantity that is not an integer", { quantity: 1.5 }],
  ["a payment method that does not exist", { method: "boleto" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await buyTickets(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateTicketOrder).not.toHaveBeenCalled();
});

/* - Testando a consulta do evento - */

test("should look for the event by id", async () => {
  await buyTickets(buildInput());

  expect(mockFindUniqueEvent).toHaveBeenCalledWith({ where: { id: eventId } });
});

test.each([
  ["does not exist", null],
  ["already happened", buildDatabaseEvent({ startsAt: pastStartsAt })],
  ["is cancelled", buildDatabaseEvent({ isCancelled: true })],
])("should return false and skip the order when the event %s", async (_description, event) => {
  mockFindUniqueEvent.mockResolvedValue(event);

  const result = await buyTickets(buildInput());

  expect(result).toBe(false);
  expect(mockCreateTicketOrder).not.toHaveBeenCalled();
});

/* - Testando a criação do pedido - */

test("should create the order, the ticket and the pending payment at once for the logged user", async () => {
  await buyTickets(buildInput());

  expect(mockCreateTicketOrder).toHaveBeenCalledTimes(1);
  expect(mockCreateTicketOrder).toHaveBeenCalledWith({
    data: {
      userId: "user 1",
      status: "pending",
      tickets: { create: { userId: "user 1", eventId, quantity: 2, unitPrice: eventPrice } },
      ticketPayments: { create: { userId: "user 1", method: "pix", status: "pending", totalValue: 100 } },
    },
    include: { tickets: true, ticketPayments: true },
  });
});

test("should charge the price of the event read from the database and not a value from the input", async () => {
  await buyTickets(buildInput({ unitPrice: 1, totalValue: 1 }));

  const orderData = mockCreateTicketOrder.mock.calls[0][0].data;

  expect(orderData.tickets.create.unitPrice).toBe(eventPrice);
  expect(orderData.ticketPayments.create.totalValue).toBe(100);
});

test.each([
  [50, 1, 50],
  [50, 2, 100],
  [12.5, 3, 37.5],
])("should charge %f for each of %i tickets as a total of %f", async (price, quantity, expectedTotal) => {
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent({ price: { toNumber: () => price } }));

  await buyTickets(buildInput({ quantity }));

  expect(mockCreateTicketOrder.mock.calls[0][0].data.ticketPayments.create.totalValue).toBe(expectedTotal);
});

test.each([["cash"], ["pix"], ["debitCard"], ["creditCard"]])("should save the %s method in the payment", async (method) => {
  await buyTickets(buildInput({ method }));

  expect(mockCreateTicketOrder.mock.calls[0][0].data.ticketPayments.create.method).toBe(method);
});

/* - Testando o resultado - */

test("should return the order with the values as numbers and the dates as ISO strings", async () => {
  const result = await buyTickets(buildInput());

  expect(result).toEqual({
    id: "order 1",
    status: "pending",
    eventId,
    quantity: 2,
    unitPrice: 50,
    method: "pix",
    paymentStatus: "pending",
    totalValue: 100,
    createdAt: "2026-01-15T18:00:00.000Z",
    updatedAt: "2026-01-16T09:30:00.000Z",
  });
});

/* - Testando as falhas - */

test.each([
  ["looking for the event", () => mockFindUniqueEvent],
  ["creating the order", () => mockCreateTicketOrder],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await buyTickets(buildInput());

  expect(result).toBe(false);
});
