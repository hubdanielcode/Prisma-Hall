import { beforeEach, expect, test, type Mock } from "vitest";
import { getUsersStats } from "@/actions/admin/users-management/getUsersStats";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockCount = prisma.user.count as unknown as Mock;

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockTransaction.mockResolvedValue([0, 0, 0, 0]);
});

/* - Testando permissão - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getUsersStats();

  expect(result).toBe(false);
  expect(mockCount).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should count the total, the admins, the verified and the not validated users", async () => {
  await getUsersStats();

  expect(mockCount).toHaveBeenCalledTimes(4);
  expect(mockCount).toHaveBeenNthCalledWith(1);
  expect(mockCount).toHaveBeenNthCalledWith(2, { where: { role: "admin" } });
  expect(mockCount).toHaveBeenNthCalledWith(3, { where: { verifiedUserBadge: true } });
  expect(mockCount).toHaveBeenNthCalledWith(4, { where: { NOT: { validatedAt: { not: null }, needsRevalidation: false } } });
});

test("should run the four counts inside a single transaction", async () => {
  await getUsersStats();

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction).toHaveBeenCalledWith(expect.any(Array));
  expect(mockTransaction.mock.calls[0][0]).toHaveLength(4);
});

/* - Testando o resultado - */

test("should return the counts with the correct names", async () => {
  mockTransaction.mockResolvedValue([100, 3, 40, 12]);

  const result = await getUsersStats();

  expect(result).toEqual({ total: 100, admins: 3, verified: 40, notValidated: 12 });
});

test("should return zeros when there are no users", async () => {
  const result = await getUsersStats();

  expect(result).toEqual({ total: 0, admins: 0, verified: 0, notValidated: 0 });
});

/* - Testando as falhas do banco - */

test("should return false when the transaction fails", async () => {
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await getUsersStats();

  expect(result).toBe(false);
});
