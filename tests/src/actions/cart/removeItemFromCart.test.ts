import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { removeItemFromCart } from "@/actions/cart/removeItemFromCart";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUnique = prisma.cart.findUnique as unknown as Mock;
const mockDelete = prisma.cart.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const cartItemId = "550e8400-e29b-41d4-a716-446655440000";

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseCartItem = (overrides: Record<string, unknown> = {}) => ({
  id: cartItemId,
  userId: "user 1",
  type: "drinks",
  quantity: 2,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUnique.mockResolvedValue(buildDatabaseCartItem());
  mockDelete.mockResolvedValue(buildDatabaseCartItem());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await removeItemFromCart(cartItemId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database when the input has %s", async (_description, invalidId) => {
  const result = await removeItemFromCart(invalidId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the cart item by its id", async () => {
  await removeItemFromCart(cartItemId);

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: cartItemId } });
});

test("should return false and skip the deletion when the cart item does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await removeItemFromCart(cartItemId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
});

test("should return false and skip the deletion when the cart item belongs to another user", async () => {
  mockFindUnique.mockResolvedValue(buildDatabaseCartItem({ userId: "user 2" }));

  const result = await removeItemFromCart(cartItemId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
});

/* - Testando a exclusão - */

test("should delete the cart item and return true", async () => {
  const result = await removeItemFromCart(cartItemId);

  expect(result).toBe(true);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith({ where: { id: cartItemId } });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the cart item", () => mockFindUnique],
  ["deleting the cart item", () => mockDelete],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await removeItemFromCart(cartItemId);

  expect(result).toBe(false);
});
