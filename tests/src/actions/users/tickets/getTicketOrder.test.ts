import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getTicketOrder } from "@/actions/users/tickets/getTicketOrder";
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
const mockFindUniqueOrder = prisma.ticketOrder.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const orderId = "550e8400-e29b-41d4-a716-446655440000";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O unitPrice e o totalValue do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildDatabaseTicket = (eventOverrides: Record<string, unknown> = {}) => ({
  id: "ticket 1",
  eventId: "event 1",
  quantity: 2,
  unitPrice: { toNumber: () => 45 },

  event: {
    id: "event 1",
    title: "Rock na Praça",
    tag: "rock",
    image: "https://blob.vercel-storage.com/1700000000000-event.png",
    isCancelled: false,
    startsAt: futureStartsAt,
    attraction: { name: "Banda Prisma" },
    ...eventOverrides,
  },
});

const buildDatabasePayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  method: "pix",
  status: "confirmed",
  totalValue: { toNumber: () => 99 },
  confirmedAt: new Date("2026-01-15T18:30:00.000Z"),
  pickedUpAt: null,
  createdAt: new Date("2026-01-15T18:00:00.000Z"),
  ...overrides,
});

const buildDatabaseOrder = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  userId: "user 1",
  status: "confirmed",
  tickets: [buildDatabaseTicket()],
  ticketPayments: [buildDatabasePayment()],
  createdAt: new Date("2026-01-15T18:00:00.000Z"),
  updatedAt: new Date("2026-01-16T09:30:00.000Z"),
  ...overrides,
});

const expectedOrder = {
  id: orderId,
  status: "confirmed",

  tickets: [
    {
      id: "ticket 1",
      eventId: "event 1",
      quantity: 2,
      unitPrice: 45,

      event: {
        id: "event 1",
        title: "Rock na Praça",
        tag: "rock",
        attractionName: "Banda Prisma",
        image: "https://blob.vercel-storage.com/1700000000000-event.png",
        status: "soon",
        startsAt: "2099-01-01T20:00:00.000Z",
      },
    },
  ],

  payments: [
    {
      id: "payment 1",
      method: "pix",
      status: "confirmed",
      totalValue: 99,
      confirmedAt: "2026-01-15T18:30:00.000Z",
      pickedUpAt: null,
      createdAt: "2026-01-15T18:00:00.000Z",
    },
  ],

  createdAt: "2026-01-15T18:00:00.000Z",
  updatedAt: "2026-01-16T09:30:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getTicketOrder(orderId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await getTicketOrder(invalidId);

  expect(result).toBe(false);
  expect(mockFindUniqueOrder).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the order with its tickets, events and payments, from the newest payment to the oldest", async () => {
  await getTicketOrder(orderId);

  expect(mockFindUniqueOrder).toHaveBeenCalledWith({
    where: { id: orderId },
    include: {
      tickets: { include: { event: { include: { attraction: { select: { name: true } } } } } },
      ticketPayments: { orderBy: { createdAt: "desc" } },
    },
  });
});

test.each([
  ["does not exist", null],
  ["belongs to another user", buildDatabaseOrder({ userId: "user 2" })],
])("should return false when the order %s", async (_description, order) => {
  mockFindUniqueOrder.mockResolvedValue(order);

  const result = await getTicketOrder(orderId);

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the order with the values as numbers and the dates as ISO strings", async () => {
  const result = await getTicketOrder(orderId);

  expect(result).toEqual(expectedOrder);
});

test.each([
  ["soon", { startsAt: futureStartsAt }],
  ["happened", { startsAt: pastStartsAt }],
  ["cancelled", { isCancelled: true }],
])("should return the event as %s", async (expectedStatus, eventOverrides) => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ tickets: [buildDatabaseTicket(eventOverrides)] }));

  const result = await getTicketOrder(orderId);

  expect(result).toEqual(
    expect.objectContaining({ tickets: [expect.objectContaining({ event: expect.objectContaining({ status: expectedStatus }) })] }),
  );
});

test("should return the confirmation and pickup dates as ISO strings when they exist", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({ ticketPayments: [buildDatabasePayment({ pickedUpAt: new Date("2026-01-17T12:00:00.000Z") })] }),
  );

  const result = await getTicketOrder(orderId);

  expect(result).toEqual(
    expect.objectContaining({
      payments: [expect.objectContaining({ confirmedAt: "2026-01-15T18:30:00.000Z", pickedUpAt: "2026-01-17T12:00:00.000Z" })],
    }),
  );
});

test("should return null in the confirmation and pickup dates of a payment that is still pending", async () => {
  mockFindUniqueOrder.mockResolvedValue(buildDatabaseOrder({ ticketPayments: [buildDatabasePayment({ status: "pending", confirmedAt: null })] }));

  const result = await getTicketOrder(orderId);

  expect(result).toEqual(expect.objectContaining({ payments: [expect.objectContaining({ confirmedAt: null, pickedUpAt: null })] }));
});

test("should return every ticket and payment in the order that came from the database", async () => {
  mockFindUniqueOrder.mockResolvedValue(
    buildDatabaseOrder({
      tickets: [{ ...buildDatabaseTicket(), id: "ticket 2" }, buildDatabaseTicket()],
      ticketPayments: [buildDatabasePayment({ id: "payment 2" }), buildDatabasePayment()],
    }),
  );

  const result = await getTicketOrder(orderId);

  expect(result).toEqual(
    expect.objectContaining({
      tickets: [expect.objectContaining({ id: "ticket 2" }), expect.objectContaining({ id: "ticket 1" })],
      payments: [expect.objectContaining({ id: "payment 2" }), expect.objectContaining({ id: "payment 1" })],
    }),
  );
});

/* - Testando as falhas - */

test("should return false when looking for the order fails", async () => {
  mockFindUniqueOrder.mockRejectedValue(new Error("service error"));

  const result = await getTicketOrder(orderId);

  expect(result).toBe(false);
});
