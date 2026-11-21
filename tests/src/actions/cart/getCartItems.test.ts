import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getCartItems } from "@/actions/cart/getCartItems";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o mapCartItem e o getEventStatus continuam os reais) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindMany = prisma.cart.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const productId = "550e8400-e29b-41d4-a716-446655440000";
const eventId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price do Prisma é um Decimal, por isso os mocks têm o método toNumber

const buildDatabaseProduct = (overrides: Record<string, unknown> = {}) => ({
  id: productId,
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
  price: { toNumber: () => 12.5 },
  status: "active",
  ...overrides,
});

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  isCancelled: false,
  price: { toNumber: () => 50 },
  startsAt: futureStartsAt,
  attraction: { name: "Banda Prisma" },
  ...overrides,
});

// O price salvo no carrinho (10) é diferente do price atual do produto (12.5) de propósito

const buildDatabaseDrinkItem = (overrides: Record<string, unknown> = {}) => ({
  id: "cart 1",
  userId: "user 1",
  type: "drinks",
  productId,
  eventId: null,
  quantity: 2,
  price: { toNumber: () => 10 },
  product: buildDatabaseProduct(),
  event: null,
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildDatabaseTicketItem = (overrides: Record<string, unknown> = {}) => ({
  id: "cart 2",
  userId: "user 1",
  type: "tickets",
  productId: null,
  eventId,
  quantity: 1,
  price: { toNumber: () => 40 },
  product: null,
  event: buildDatabaseEvent(),
  createdAt: new Date("2026-01-10T13:00:00.000Z"),
  updatedAt: new Date("2026-01-11T13:00:00.000Z"),
  ...overrides,
});

const expectedDrinkItem = {
  id: "cart 1",
  type: "drinks",
  productId,
  eventId: null,
  quantity: 2,
  price: 12.5,

  product: {
    id: productId,
    name: "Heineken",
    category: "beers",
    image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
    quantity: 10,
    status: "active",
  },

  event: null,

  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

const expectedTicketItem = {
  id: "cart 2",
  type: "tickets",
  productId: null,
  eventId,
  quantity: 1,
  price: 50,

  product: null,

  event: {
    id: eventId,
    title: "Rock na Praça",
    attractionName: "Banda Prisma",
    image: "https://blob.vercel-storage.com/1700000000000-event.png",
    startsAt: "2099-01-01T20:00:00.000Z",
    status: "soon",
  },

  createdAt: "2026-01-10T13:00:00.000Z",
  updatedAt: "2026-01-11T13:00:00.000Z",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a sessão - */

test("should throw an error and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  await expect(getCartItems()).rejects.toThrow("Acesso negado.");
  expect(mockFindMany).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the cart items of the user in the session ordered by creation date", async () => {
  await getCartItems();

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    include: { product: true, event: { include: { attraction: { select: { name: true } } } } },
    orderBy: { createdAt: "asc" },
  });
});

/* - Testando o resultado - */

test("should return an empty list when the cart is empty", async () => {
  const result = await getCartItems();

  expect(result).toEqual([]);
});

test("should return the drink with the product data and the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseDrinkItem()]);

  const result = await getCartItems();

  expect(result).toEqual([expectedDrinkItem]);
});

test("should return the ticket with the event data, the attraction name and the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseTicketItem()]);

  const result = await getCartItems();

  expect(result).toEqual([expectedTicketItem]);
});

test("should use the current price of the product and the event instead of the price saved in the cart", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseDrinkItem(), buildDatabaseTicketItem()]);

  const result = await getCartItems();

  expect(result.map((item) => item.price)).toEqual([12.5, 50]);
});

test.each([
  ["an event that has not started", { startsAt: futureStartsAt }, "soon"],
  ["an event that already happened", { startsAt: pastStartsAt }, "happened"],
  ["a cancelled event", { isCancelled: true }, "cancelled"],
])("should return the ticket status according to the event when it is %s", async (_description, eventOverrides, expectedStatus) => {
  mockFindMany.mockResolvedValue([buildDatabaseTicketItem({ event: buildDatabaseEvent(eventOverrides) })]);

  const result = await getCartItems();

  expect(result[0].event?.status).toBe(expectedStatus);
});

test("should return every item in the same order as the database", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseTicketItem(), buildDatabaseDrinkItem()]);

  const result = await getCartItems();

  expect(result).toEqual([expectedTicketItem, expectedDrinkItem]);
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the cart items fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getCartItems()).rejects.toThrow("Erro ao buscar itens do carrinho.");
});
