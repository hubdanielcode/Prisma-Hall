import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { addItemToCart } from "@/actions/cart/addItemToCart";
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
const mockFindUniqueProduct = prisma.product.findUnique as unknown as Mock;
const mockFindUniqueEvent = prisma.event.findUnique as unknown as Mock;
const mockFindUniqueCart = prisma.cart.findUnique as unknown as Mock;
const mockCreateCart = prisma.cart.create as unknown as Mock;
const mockUpdateCart = prisma.cart.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type AddItemToCartInput = Parameters<typeof addItemToCart>[0];

const productId = "550e8400-e29b-41d4-a716-446655440000";
const eventId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildDrinkInput = (overrides: Partial<AddItemToCartInput> = {}): AddItemToCartInput => ({
  type: "drinks",
  productId,
  quantity: 2,
  ...overrides,
});

const buildTicketInput = (overrides: Partial<AddItemToCartInput> = {}): AddItemToCartInput => ({
  type: "tickets",
  eventId,
  quantity: 2,
  ...overrides,
});

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

// O price do Prisma é um Decimal, por isso os mocks têm o método toNumber (o mesmo objeto é reaproveitado para comparar o price enviado ao banco)

const productPrice = { toNumber: () => 12.5 };
const eventPrice = { toNumber: () => 50 };

const buildDatabaseProduct = (overrides: Record<string, unknown> = {}) => ({
  id: productId,
  name: "Heineken",
  category: "beers",
  image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
  quantity: 10,
  price: productPrice,
  status: "active",
  ...overrides,
});

const buildDatabaseEvent = (overrides: Record<string, unknown> = {}) => ({
  id: eventId,
  title: "Rock na Praça",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  isCancelled: false,
  price: eventPrice,
  startsAt: futureStartsAt,
  attraction: { name: "Banda Prisma" },
  ...overrides,
});

const buildDatabaseDrinkItem = (overrides: Record<string, unknown> = {}) => ({
  id: "cart 1",
  userId: "user 1",
  type: "drinks",
  productId,
  eventId: null,
  quantity: 2,
  price: productPrice,
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
  quantity: 2,
  price: eventPrice,
  createdAt: new Date("2026-01-10T13:00:00.000Z"),
  updatedAt: new Date("2026-01-11T13:00:00.000Z"),
  ...overrides,
});

const expectedProduct = {
  id: productId,
  name: "Heineken",
  category: "beers",
  image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
  quantity: 10,
  status: "active",
};

const expectedEvent = {
  id: eventId,
  title: "Rock na Praça",
  attractionName: "Banda Prisma",
  image: "https://blob.vercel-storage.com/1700000000000-event.png",
  startsAt: "2099-01-01T20:00:00.000Z",
  status: "soon",
};

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUniqueProduct.mockResolvedValue(buildDatabaseProduct());
  mockFindUniqueEvent.mockResolvedValue(buildDatabaseEvent());
  mockFindUniqueCart.mockResolvedValue(null);
  mockCreateCart.mockResolvedValue(buildDatabaseDrinkItem());
  mockUpdateCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 5 }));
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await addItemToCart(buildDrinkInput());

  expect(result).toBe(false);
  expect(mockFindUniqueProduct).not.toHaveBeenCalled();
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test.each([
  ["an unknown type", buildDrinkInput({ type: "invalid" as never })],
  ["a zero quantity", buildDrinkInput({ quantity: 0 })],
  ["a negative quantity", buildDrinkInput({ quantity: -1 })],
  ["a quantity that is not an integer", buildDrinkInput({ quantity: 1.5 })],
  ["no quantity", buildDrinkInput({ quantity: undefined as never })],
  ["a product id that is not a uuid", buildDrinkInput({ productId: "not-a-uuid" })],
  ["an event id that is not a uuid", buildTicketInput({ eventId: "not-a-uuid" })],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await addItemToCart(invalidInput);

  expect(result).toBe(false);
  expect(mockFindUniqueProduct).not.toHaveBeenCalled();
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
  expect(mockUpdateCart).not.toHaveBeenCalled();
});

/* - Testando as bebidas: consulta ao banco - */

test("should return false and skip the database when the drink has no product id", async () => {
  const result = await addItemToCart(buildDrinkInput({ productId: undefined }));

  expect(result).toBe(false);
  expect(mockFindUniqueProduct).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test("should look for the product and then for the drink in the cart of the user", async () => {
  await addItemToCart(buildDrinkInput());

  expect(mockFindUniqueProduct).toHaveBeenCalledWith({ where: { id: productId } });
  expect(mockFindUniqueCart).toHaveBeenCalledWith({ where: { userId_productId: { userId: "user 1", productId } } });
});

test.each([
  ["the product does not exist", null],
  ["the product is not active", buildDatabaseProduct({ status: "inactive" })],
])("should return false and skip the cart when %s", async (_description, product) => {
  mockFindUniqueProduct.mockResolvedValue(product);

  const result = await addItemToCart(buildDrinkInput());

  expect(result).toBe(false);
  expect(mockFindUniqueCart).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
});

/* - Testando as bebidas: item novo no carrinho - */

test("should create the drink in the cart with the quantity of the input and the current price of the product", async () => {
  await addItemToCart(buildDrinkInput({ quantity: 2 }));

  expect(mockCreateCart).toHaveBeenCalledWith({
    data: { userId: "user 1", productId, type: "drinks", quantity: 2, price: productPrice },
  });
  expect(mockUpdateCart).not.toHaveBeenCalled();
});

test("should return false and skip the creation when the quantity is above the stock", async () => {
  const result = await addItemToCart(buildDrinkInput({ quantity: 11 }));

  expect(result).toBe(false);
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test("should create the drink when the quantity is exactly the stock", async () => {
  await addItemToCart(buildDrinkInput({ quantity: 10 }));

  expect(mockCreateCart).toHaveBeenCalledTimes(1);
});

test("should return the created drink with the product data and the dates as strings", async () => {
  const result = await addItemToCart(buildDrinkInput());

  expect(result).toEqual({
    id: "cart 1",
    type: "drinks",
    productId,
    eventId: null,
    quantity: 2,
    price: 12.5,
    product: expectedProduct,
    event: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
});

/* - Testando as bebidas: item que já está no carrinho - */

test("should sum the quantity and update the price when the drink is already in the cart", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 3 }));

  await addItemToCart(buildDrinkInput({ quantity: 2 }));

  expect(mockUpdateCart).toHaveBeenCalledWith({
    where: { id: "cart 1" },
    data: { quantity: 5, price: productPrice },
  });
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test("should return false and skip the update when the summed quantity is above the stock", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 9 }));

  const result = await addItemToCart(buildDrinkInput({ quantity: 2 }));

  expect(result).toBe(false);
  expect(mockUpdateCart).not.toHaveBeenCalled();
});

test("should update the drink when the summed quantity is exactly the stock", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 8 }));

  await addItemToCart(buildDrinkInput({ quantity: 2 }));

  expect(mockUpdateCart).toHaveBeenCalledTimes(1);
});

test("should return the updated drink with the product data and the dates as strings", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 3 }));

  const result = await addItemToCart(buildDrinkInput({ quantity: 2 }));

  expect(result).toEqual({
    id: "cart 1",
    type: "drinks",
    productId,
    eventId: null,
    quantity: 5,
    price: 12.5,
    product: expectedProduct,
    event: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
});

/* - Testando as bebidas: falhas do banco - */

test.each([
  ["looking for the product", () => mockFindUniqueProduct],
  ["looking for the drink in the cart", () => mockFindUniqueCart],
  ["creating the drink in the cart", () => mockCreateCart],
])("should return false and skip the tickets lookup when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await addItemToCart(buildDrinkInput());

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
});

test("should return false when updating the drink in the cart fails", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseDrinkItem({ quantity: 3 }));
  mockUpdateCart.mockRejectedValue(new Error("db error"));

  const result = await addItemToCart(buildDrinkInput());

  expect(result).toBe(false);
});

/* - Testando os ingressos: consulta ao banco - */

test("should return false and skip the database when the ticket has no event id", async () => {
  const result = await addItemToCart(buildTicketInput({ eventId: undefined }));

  expect(result).toBe(false);
  expect(mockFindUniqueEvent).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test("should look for the event with the attraction name and then for the ticket in the cart of the user", async () => {
  await addItemToCart(buildTicketInput());

  expect(mockFindUniqueProduct).not.toHaveBeenCalled();
  expect(mockFindUniqueEvent).toHaveBeenCalledWith({ where: { id: eventId }, include: { attraction: { select: { name: true } } } });
  expect(mockFindUniqueCart).toHaveBeenCalledWith({ where: { userId_eventId: { userId: "user 1", eventId } } });
});

test.each([
  ["the event does not exist", null],
  ["the event already happened", buildDatabaseEvent({ startsAt: pastStartsAt })],
  ["the event is cancelled", buildDatabaseEvent({ isCancelled: true })],
])("should return false and skip the cart when %s", async (_description, event) => {
  mockFindUniqueEvent.mockResolvedValue(event);

  const result = await addItemToCart(buildTicketInput());

  expect(result).toBe(false);
  expect(mockFindUniqueCart).not.toHaveBeenCalled();
  expect(mockCreateCart).not.toHaveBeenCalled();
});

/* - Testando os ingressos: item novo no carrinho - */

test("should create the ticket in the cart with the quantity of the input and the current price of the event", async () => {
  mockCreateCart.mockResolvedValue(buildDatabaseTicketItem());

  await addItemToCart(buildTicketInput({ quantity: 2 }));

  expect(mockCreateCart).toHaveBeenCalledWith({
    data: { userId: "user 1", eventId, type: "tickets", quantity: 2, price: eventPrice },
  });
  expect(mockUpdateCart).not.toHaveBeenCalled();
});

test("should return the created ticket with the event data and the dates as strings", async () => {
  mockCreateCart.mockResolvedValue(buildDatabaseTicketItem());

  const result = await addItemToCart(buildTicketInput());

  expect(result).toEqual({
    id: "cart 2",
    type: "tickets",
    productId: null,
    eventId,
    quantity: 2,
    price: 50,
    product: null,
    event: expectedEvent,
    createdAt: "2026-01-10T13:00:00.000Z",
    updatedAt: "2026-01-11T13:00:00.000Z",
  });
});

/* - Testando os ingressos: item que já está no carrinho - */

test("should sum the quantity and update the price when the ticket is already in the cart", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 3 }));
  mockUpdateCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 5 }));

  await addItemToCart(buildTicketInput({ quantity: 2 }));

  expect(mockUpdateCart).toHaveBeenCalledWith({
    where: { id: "cart 2" },
    data: { quantity: 5, price: eventPrice },
  });
  expect(mockCreateCart).not.toHaveBeenCalled();
});

test("should not limit the summed quantity of a ticket by any stock", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 500 }));
  mockUpdateCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 1500 }));

  const result = await addItemToCart(buildTicketInput({ quantity: 1000 }));

  expect(result).not.toBe(false);
  expect(mockUpdateCart).toHaveBeenCalledWith({
    where: { id: "cart 2" },
    data: { quantity: 1500, price: eventPrice },
  });
});

test("should return the updated ticket with the event data and the dates as strings", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 3 }));
  mockUpdateCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 5 }));

  const result = await addItemToCart(buildTicketInput({ quantity: 2 }));

  expect(result).toEqual({
    id: "cart 2",
    type: "tickets",
    productId: null,
    eventId,
    quantity: 5,
    price: 50,
    product: null,
    event: expectedEvent,
    createdAt: "2026-01-10T13:00:00.000Z",
    updatedAt: "2026-01-11T13:00:00.000Z",
  });
});

/* - Testando os ingressos: falhas do banco - */

test.each([
  ["looking for the event", () => mockFindUniqueEvent],
  ["looking for the ticket in the cart", () => mockFindUniqueCart],
  ["creating the ticket in the cart", () => mockCreateCart],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await addItemToCart(buildTicketInput());

  expect(result).toBe(false);
});

test("should return false when updating the ticket in the cart fails", async () => {
  mockFindUniqueCart.mockResolvedValue(buildDatabaseTicketItem({ quantity: 3 }));
  mockUpdateCart.mockRejectedValue(new Error("db error"));

  const result = await addItemToCart(buildTicketInput());

  expect(result).toBe(false);
});
