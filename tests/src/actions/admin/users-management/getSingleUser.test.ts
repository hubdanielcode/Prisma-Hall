import { beforeEach, expect, test, type Mock } from "vitest";
import { getSingleUser } from "@/actions/admin/users-management/getSingleUser";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";
import { UserScalarFieldEnum } from "@/prisma/generated/prisma/internal/prismaNamespace";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockFindUnique = prisma.user.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const userId = "550e8400-e29b-41d4-a716-446655440000";

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: userId,
  name: "Maria Silva",
  email: "maria@email.com",
  role: "user",
  verifiedUserBadge: true,
  frequentUserBadge: "silver",
  oldUserBadge: "bronze",
  profilePicture: "https://blob.vercel-storage.com/maria.png",
  validatedAt: new Date("2026-01-10T12:00:00.000Z"),
  needsRevalidation: false,
  createdAt: new Date("2026-01-09T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const buildExpectedUser = (overrides: Record<string, unknown> = {}) => ({
  id: userId,
  name: "Maria Silva",
  email: "maria@email.com",
  role: "user",
  verifiedBadge: true,
  frequentUser: "silver",
  oldUser: "bronze",
  profilePicture: "https://blob.vercel-storage.com/maria.png",
  validatedAt: "2026-01-10T12:00:00.000Z",
  createdAt: "2026-01-09T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue(buildDatabaseUser());
});

/* - Testando permissão - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getSingleUser(userId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the user by id selecting only the safe fields", async () => {
  await getSingleUser(userId);

  expect(mockFindUnique).toHaveBeenCalledWith({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verifiedUserBadge: true,
      frequentUserBadge: true,
      oldUserBadge: true,
      profilePicture: true,
      validatedAt: true,
      needsRevalidation: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

test("should never select the password and the tokens", async () => {
  await getSingleUser(userId);

  const { select } = mockFindUnique.mock.calls[0][0];

  expect(select).not.toHaveProperty("password");
  expect(select).not.toHaveProperty("token");
  expect(select).not.toHaveProperty("tokenExpiresAt");
  expect(select).not.toHaveProperty("validationToken");
});

// Garante que cada campo do select existe no model User (o Prisma rejeita campos que não existem)

test("should select only fields that exist in the user model", async () => {
  await getSingleUser(userId);

  const { select } = mockFindUnique.mock.calls[0][0];
  const userFields = Object.values(UserScalarFieldEnum) as string[];

  expect(Object.keys(select).filter((field) => !userFields.includes(field))).toEqual([]);
});

/* - Testando o resultado - */

test("should return false when the user does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await getSingleUser(userId);

  expect(result).toBe(false);
});

test("should return the user with the dates as strings", async () => {
  const result = await getSingleUser(userId);

  expect(result).toEqual(buildExpectedUser());
});

test.each([
  ["the user was never validated", { validatedAt: null, needsRevalidation: false }],
  ["the user needs a new validation", { needsRevalidation: true }],
  ["the user was never validated and needs a new validation", { validatedAt: null, needsRevalidation: true }],
])("should return a null validatedAt when %s", async (_description, overrides) => {
  mockFindUnique.mockResolvedValue(buildDatabaseUser(overrides));

  const result = await getSingleUser(userId);

  expect(result).toEqual(buildExpectedUser({ validatedAt: null }));
});

test("should not expose needsRevalidation in the result", async () => {
  const result = await getSingleUser(userId);

  expect(result).not.toHaveProperty("needsRevalidation");
});

test("should keep a null profile picture", async () => {
  mockFindUnique.mockResolvedValue(buildDatabaseUser({ profilePicture: null }));

  const result = await getSingleUser(userId);

  expect(result).toEqual(buildExpectedUser({ profilePicture: null }));
});

/* - Testando as falhas do banco - */

test("should throw a generic error when the database fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  await expect(getSingleUser(userId)).rejects.toThrow("Erro ao buscar usuário.");
});
