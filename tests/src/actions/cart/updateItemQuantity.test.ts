import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { updateItemQuantity } from "@/actions/cart/updateItemQuantity";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup; o getEventStatus e o mapCartItem continuam os reais) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");
  const { getEventStatus } = await import("@/lib/server/events/getEventStatus");

  return { prisma, getEventStatus };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUnique = prisma.cart.findUnique as unknown as Mock;
const mockUpdate = prisma.cart.update as unknown as Mock;

/* - Funções e dados auxiliares - */

type UpdateItemQuantityInput = Parameters<typeof updateItemQuantity>[0];

const cartItemId = "550e8400-e29b-41d4-a716-446655440000";
const productId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const eventId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const futureStartsAt = new Date("2099-01-01T20:00:00.000Z");
const pastStartsAt = new Date("2020-01-01T20:00:00.000Z");

const buildInput = (overrides: Partial<UpdateItemQuantityInput> = {}): UpdateItemQuantityInput => ({
  cartItemId,
  quantity: 3,
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

const buildExistingDrinkItem = (overrides: Record<string, unknown> = {}) => ({
  id: cartItemId,
  userId: "user 1",
  type: "drinks",
  productId,
  eventId: null,
  quantity: 1,
  product: buildDatabaseProduct(),
  event: null,
  ...overrides,
});

const buildExistingTicketItem = (overrides: Record<string, unknown> = {}) => ({
  id: cartItemId,
  userId: "user 1",
  type: "tickets",
  productId: null,
  eventId,
  quantity: 1,
  product: null,
  event: buildDatabaseEvent(),
  ...overrides,
});

const buildEditedDrinkItem = () => ({
  ...buildExistingDrinkItem({ quantity: 3 }),
  price: productPrice,
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

const buildEditedTicketItem = () => ({
  ...buildExistingTicketItem({ quantity: 3 }),
  price: eventPrice,
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUnique.mockResolvedValue(buildExistingDrinkItem());
  mockUpdate.mockResolvedValue(buildEditedDrinkItem());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

test.each([
  ["an empty cart item id", { cartItemId: "" }],
  ["a cart item id that is not a uuid", { cartItemId: "not-a-uuid" }],
  ["a zero quantity", { quantity: 0 }],
  ["a negative quantity", { quantity: -1 }],
  ["a quantity that is not an integer", { quantity: 1.5 }],
  ["no quantity", { quantity: undefined }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await updateItemQuantity(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the cart item with its product and event", async () => {
  await updateItemQuantity(buildInput());

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: cartItemId }, include: { product: true, event: true } });
});

test("should return false and skip the update when the cart item does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should return false and skip the update when the cart item belongs to another user", async () => {
  mockFindUnique.mockResolvedValue(buildExistingDrinkItem({ userId: "user 2" }));

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

/* - Testando as bebidas - */

test.each([
  ["the product does not exist anymore", null],
  ["the product is not active", buildDatabaseProduct({ status: "inactive" })],
])("should return false and skip the update when the item is a drink and %s", async (_description, product) => {
  mockFindUnique.mockResolvedValue(buildExistingDrinkItem({ product }));

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should return false and skip the update when the new quantity is above the stock", async () => {
  mockFindUnique.mockResolvedValue(buildExistingDrinkItem({ product: buildDatabaseProduct({ quantity: 10 }) }));

  const result = await updateItemQuantity(buildInput({ quantity: 11 }));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should update the drink when the new quantity is exactly the stock", async () => {
  mockFindUnique.mockResolvedValue(buildExistingDrinkItem({ product: buildDatabaseProduct({ quantity: 10 }) }));

  await updateItemQuantity(buildInput({ quantity: 10 }));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
});

test("should update the drink with the new quantity and the current price of the product", async () => {
  await updateItemQuantity(buildInput({ quantity: 3 }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: cartItemId },
    data: { quantity: 3, price: productPrice },
    include: { product: true, event: { include: { attraction: { select: { name: true } } } } },
  });
});

test("should return the updated drink with the product data and the dates as strings", async () => {
  const result = await updateItemQuantity(buildInput({ quantity: 3 }));

  expect(result).toEqual({
    id: cartItemId,
    type: "drinks",
    productId,
    eventId: null,
    quantity: 3,
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
  });
});

/* - Testando os ingressos - */

test.each([
  ["the event does not exist anymore", null],
  ["the event already happened", buildDatabaseEvent({ startsAt: pastStartsAt })],
  ["the event is cancelled", buildDatabaseEvent({ isCancelled: true })],
])("should return false and skip the update when the item is a ticket and %s", async (_description, event) => {
  mockFindUnique.mockResolvedValue(buildExistingTicketItem({ event }));

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
});

test("should update the ticket with the new quantity and the current price of the event", async () => {
  mockFindUnique.mockResolvedValue(buildExistingTicketItem());
  mockUpdate.mockResolvedValue(buildEditedTicketItem());

  await updateItemQuantity(buildInput({ quantity: 3 }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: cartItemId },
    data: { quantity: 3, price: eventPrice },
    include: { product: true, event: { include: { attraction: { select: { name: true } } } } },
  });
});

test("should not limit the quantity of a ticket by any stock", async () => {
  mockFindUnique.mockResolvedValue(buildExistingTicketItem());
  mockUpdate.mockResolvedValue(buildEditedTicketItem());

  await updateItemQuantity(buildInput({ quantity: 1000 }));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
});

test("should return the updated ticket with the event data, the attraction name and the dates as strings", async () => {
  mockFindUnique.mockResolvedValue(buildExistingTicketItem());
  mockUpdate.mockResolvedValue(buildEditedTicketItem());

  const result = await updateItemQuantity(buildInput({ quantity: 3 }));

  expect(result).toEqual({
    id: cartItemId,
    type: "tickets",
    productId: null,
    eventId,
    quantity: 3,
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

    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the cart item", () => mockFindUnique],
  ["updating the cart item", () => mockUpdate],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await updateItemQuantity(buildInput());

  expect(result).toBe(false);
});
