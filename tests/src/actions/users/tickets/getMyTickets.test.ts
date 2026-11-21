import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getMyTickets } from "@/actions/users/tickets/getMyTickets";
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
const mockFindManyTickets = prisma.ticket.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");
const pickedUpAt = new Date("2026-01-17T12:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price, o unitPrice e o rating do Prisma são Decimal, por isso os mocks têm o método toNumber

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "event 1",
  title: "Rock na Praça",
  description: "Noite de rock nacional ao vivo",
  tag: "rock",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  isCancelled: false,
  price: { toNumber: () => 50 },
  startsAt: futureStartsAt,
  attendees: 120,
  rating: { toNumber: () => 4.5 },
  attraction: { id: "attraction 1", name: "Banda Prisma" },
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildPayment = (overrides: Record<string, unknown> = {}) => ({ status: "confirmed", pickedUpAt: null, ...overrides });

const buildDatabaseTicket = (overrides: Record<string, unknown> = {}) => ({
  id: "ticket 1",
  userId: "user 1",
  orderId: "order 1",
  eventId: "event 1",
  quantity: 2,
  unitPrice: { toNumber: () => 45 },
  event: buildDatabaseEvent(),
  order: { status: "confirmed", ticketPayments: [buildPayment()] },
  createdAt: new Date("2026-01-12T12:00:00.000Z"),
  updatedAt: new Date("2026-01-13T12:00:00.000Z"),
  ...overrides,
});

const expectedTicket = {
  id: "ticket 1",
  orderId: "order 1",
  eventId: "event 1",
  quantity: 2,
  unitPrice: 45,
  orderStatus: "confirmed",
  paymentStatus: "confirmed",
  pickedUpAt: null,

  event: {
    id: "event 1",
    title: "Rock na Praça",
    description: "Noite de rock nacional ao vivo",
    tag: "rock",
    attractionId: "attraction 1",
    attractionName: "Banda Prisma",
    image: "https://blob.vercel-storage.com/1700000000000-event.png",
    status: "soon",
    price: 50,
    startsAt: "2099-01-01T20:00:00.000Z",
    attendees: 120,
    rating: 4.5,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  },

  createdAt: "2026-01-12T12:00:00.000Z",
  updatedAt: "2026-01-13T12:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindManyTickets.mockResolvedValue([buildDatabaseTicket()]);
});

/* - Testando a sessão - */

test("should throw an error and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  await expect(getMyTickets()).rejects.toThrow("Acesso negado.");

  expect(mockFindManyTickets).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the tickets of the user with the event, the attraction and the latest payment, from the newest to the oldest", async () => {
  await getMyTickets();

  expect(mockFindManyTickets).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: {
      event: { include: { attraction: { select: { id: true, name: true } } } },
      order: { include: { ticketPayments: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });
});

/* - Testando o resultado - */

test("should return the tickets with the values as numbers and the dates as ISO strings", async () => {
  const result = await getMyTickets();

  expect(result).toEqual([expectedTicket]);
});

test("should use the unit price saved in the ticket and not the current price of the event", async () => {
  const result = await getMyTickets();

  expect(result[0].unitPrice).toBe(45);
  expect(result[0].event.price).toBe(50);
});

test.each([
  ["soon", { startsAt: futureStartsAt }],
  ["happened", { startsAt: pastStartsAt }],
  ["cancelled", { isCancelled: true }],
])("should return the event as %s", async (expectedStatus, eventOverrides) => {
  mockFindManyTickets.mockResolvedValue([buildDatabaseTicket({ event: buildDatabaseEvent(eventOverrides) })]);

  const result = await getMyTickets();

  expect(result[0].event.status).toBe(expectedStatus);
});

test("should return the payment as pending and no pickup when the order has no payment", async () => {
  mockFindManyTickets.mockResolvedValue([buildDatabaseTicket({ order: { status: "pending", ticketPayments: [] } })]);

  const result = await getMyTickets();

  expect(result[0].orderStatus).toBe("pending");
  expect(result[0].paymentStatus).toBe("pending");
  expect(result[0].pickedUpAt).toBeNull();
});

test("should return the pickup date as an ISO string when the pickup was registered", async () => {
  mockFindManyTickets.mockResolvedValue([buildDatabaseTicket({ order: { status: "confirmed", ticketPayments: [buildPayment({ pickedUpAt })] } })]);

  const result = await getMyTickets();

  expect(result[0].pickedUpAt).toBe("2026-01-17T12:00:00.000Z");
});

test("should keep the order that came from the database", async () => {
  mockFindManyTickets.mockResolvedValue([buildDatabaseTicket({ id: "ticket 2" }), buildDatabaseTicket({ id: "ticket 1" })]);

  const result = await getMyTickets();

  expect(result.map((ticket) => ticket.id)).toEqual(["ticket 2", "ticket 1"]);
});

test("should return an empty list when the user has no tickets", async () => {
  mockFindManyTickets.mockResolvedValue([]);

  const result = await getMyTickets();

  expect(result).toEqual([]);
});

/* - Testando as falhas - */

test("should throw an error when looking for the tickets fails", async () => {
  mockFindManyTickets.mockRejectedValue(new Error("service error"));

  await expect(getMyTickets()).rejects.toThrow("Erro ao buscar ingressos.");
});
