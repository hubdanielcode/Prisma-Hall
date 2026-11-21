import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { clearCart } from "@/actions/cart/clearCart";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockDeleteMany = prisma.cart.deleteMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockDeleteMany.mockResolvedValue({ count: 2 });
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await clearCart();

  expect(result).toBe(false);
  expect(mockDeleteMany).not.toHaveBeenCalled();
});

/* - Testando a exclusão - */

test("should delete all the cart items of the user in the session", async () => {
  await clearCart();

  expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "user 1" } });
});

/* - Testando o resultado - */

test("should return true when the cart is cleared", async () => {
  const result = await clearCart();

  expect(result).toBe(true);
});

test("should return true when the cart was already empty", async () => {
  mockDeleteMany.mockResolvedValue({ count: 0 });

  const result = await clearCart();

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return false when clearing the cart fails", async () => {
  mockDeleteMany.mockRejectedValue(new Error("db error"));

  const result = await clearCart();

  expect(result).toBe(false);
});
