import { beforeEach, expect, test, type Mock } from "vitest";
import { getAllUsers } from "@/actions/admin/users-management/getAllUsers";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";
import { UserScalarFieldEnum } from "@/prisma/generated/prisma/internal/prismaNamespace";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockCount = prisma.user.count as unknown as Mock;
const mockFindMany = prisma.user.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type GetAllUsersInput = Parameters<typeof getAllUsers>[0];

const buildInput = (overrides: Partial<GetAllUsersInput> = {}): GetAllUsersInput => ({
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: "",
  selectedRole: "all_roles",
  selectedStatus: "all_status",
  ...overrides,
});

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
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
  id: "user 1",
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
  mockTransaction.mockResolvedValue([0, []]);
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await getAllUsers(buildInput());

  expect(result).toBe(false);
  expect(mockCount).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

test.each([
  ["a page under 1", { currentPage: 0 }],
  ["a page that is not an integer", { currentPage: 1.5 }],
  ["no items per page", { itemsPerPage: 0 }],
  ["items per page over 50", { itemsPerPage: 51 }],
  ["items per page that is not an integer", { itemsPerPage: 10.5 }],
  ["a search over 100 characters", { searchQuery: "a".repeat(101) }],
  ["an unknown role", { selectedRole: "invalid" }],
  ["an unknown status", { selectedStatus: "invalid" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await getAllUsers(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockCount).not.toHaveBeenCalled();
  expect(mockFindMany).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando os filtros aplicados no banco - */

test("should not filter anything when no filter is selected", async () => {
  await getAllUsers(buildInput());

  expect(mockCount).toHaveBeenCalledWith({ where: {} });
  expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
});

test("should search by name or e-mail using the trimmed query", async () => {
  await getAllUsers(buildInput({ searchQuery: "  maria  " }));

  const expectedWhere = {
    OR: [{ name: { contains: "maria", mode: "insensitive" } }, { email: { contains: "maria", mode: "insensitive" } }],
  };

  expect(mockCount).toHaveBeenCalledWith({ where: expectedWhere });
  expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: expectedWhere }));
});

test("should not search when the query has only spaces", async () => {
  await getAllUsers(buildInput({ searchQuery: "   " }));

  expect(mockCount).toHaveBeenCalledWith({ where: {} });
});

test.each([["user"], ["admin"]] as const)("should filter by the %s role", async (selectedRole) => {
  await getAllUsers(buildInput({ selectedRole }));

  expect(mockCount).toHaveBeenCalledWith({ where: { role: selectedRole } });
});

test("should filter only the validated users that do not need a new validation", async () => {
  await getAllUsers(buildInput({ selectedStatus: "validated" }));

  expect(mockCount).toHaveBeenCalledWith({ where: { validatedAt: { not: null }, needsRevalidation: false } });
});

test("should filter the users that are not validated or need a new validation", async () => {
  await getAllUsers(buildInput({ selectedStatus: "not_validated" }));

  expect(mockCount).toHaveBeenCalledWith({ where: { NOT: { validatedAt: { not: null }, needsRevalidation: false } } });
});

test("should combine the search, the role and the status filters", async () => {
  await getAllUsers(buildInput({ searchQuery: "maria", selectedRole: "admin", selectedStatus: "validated" }));

  expect(mockCount).toHaveBeenCalledWith({
    where: {
      OR: [{ name: { contains: "maria", mode: "insensitive" } }, { email: { contains: "maria", mode: "insensitive" } }],
      role: "admin",
      validatedAt: { not: null },
      needsRevalidation: false,
    },
  });
});

test("should use the same filter to count and to list the users", async () => {
  await getAllUsers(buildInput({ searchQuery: "maria", selectedRole: "user", selectedStatus: "not_validated" }));

  expect(mockFindMany.mock.calls[0][0].where).toEqual(mockCount.mock.calls[0][0].where);
});

/* - Testando a consulta de usuários - */

test("should select only the safe fields", async () => {
  await getAllUsers(buildInput());

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
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
    }),
  );
});

test("should never select the password and the tokens", async () => {
  await getAllUsers(buildInput());

  const { select } = mockFindMany.mock.calls[0][0];

  expect(select).not.toHaveProperty("password");
  expect(select).not.toHaveProperty("token");
  expect(select).not.toHaveProperty("tokenExpiresAt");
  expect(select).not.toHaveProperty("validationToken");
});

// Garante que cada campo do select existe no model User (o Prisma rejeita campos que não existem)

test("should select only fields that exist in the user model", async () => {
  await getAllUsers(buildInput());

  const { select } = mockFindMany.mock.calls[0][0];
  const userFields = Object.values(UserScalarFieldEnum) as string[];

  expect(Object.keys(select).filter((field) => !userFields.includes(field))).toEqual([]);
});

test("should order by the newest users and use the id to break ties", async () => {
  await getAllUsers(buildInput());

  expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: [{ createdAt: "desc" }, { id: "asc" }] }));
});

test.each([
  [1, 10, 0],
  [2, 10, 10],
  [3, 25, 50],
])("should skip the previous pages when the page is %s with %s items per page", async (currentPage, itemsPerPage, expectedSkip) => {
  await getAllUsers(buildInput({ currentPage, itemsPerPage }));

  expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ skip: expectedSkip, take: itemsPerPage }));
});

test("should run the count and the list inside a single transaction", async () => {
  await getAllUsers(buildInput());

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction.mock.calls[0][0]).toHaveLength(2);
});

/* - Testando o resultado - */

test("should return an empty list with no pages when there are no users", async () => {
  const result = await getAllUsers(buildInput());

  expect(result).toEqual({ users: [], total: 0, totalPages: 0 });
});

test("should return the users with the dates as strings", async () => {
  mockTransaction.mockResolvedValue([1, [buildDatabaseUser()]]);

  const result = await getAllUsers(buildInput());

  expect(result).toEqual({ users: [buildExpectedUser()], total: 1, totalPages: 1 });
});

test("should return the users in the same order they came from the database", async () => {
  mockTransaction.mockResolvedValue([2, [buildDatabaseUser({ id: "user 2" }), buildDatabaseUser({ id: "user 1" })]]);

  const result = await getAllUsers(buildInput());

  expect(result).toEqual(expect.objectContaining({ users: [expect.objectContaining({ id: "user 2" }), expect.objectContaining({ id: "user 1" })] }));
});

test.each([
  ["the user was never validated", { validatedAt: null, needsRevalidation: false }],
  ["the user needs a new validation", { needsRevalidation: true }],
  ["the user was never validated and needs a new validation", { validatedAt: null, needsRevalidation: true }],
])("should return a null validatedAt when %s", async (_description, overrides) => {
  mockTransaction.mockResolvedValue([1, [buildDatabaseUser(overrides)]]);

  const result = await getAllUsers(buildInput());

  expect(result).toEqual(expect.objectContaining({ users: [buildExpectedUser({ validatedAt: null })] }));
});

test("should not expose needsRevalidation in the users", async () => {
  mockTransaction.mockResolvedValue([1, [buildDatabaseUser()]]);

  const result = await getAllUsers(buildInput());

  expect(result).not.toBe(false);
  expect((result as { users: object[] }).users[0]).not.toHaveProperty("needsRevalidation");
});

test.each([
  [1, 10, 1],
  [10, 10, 1],
  [11, 10, 2],
  [95, 10, 10],
  [101, 50, 3],
])("should return the correct number of pages for %s users with %s items per page", async (total, itemsPerPage, expectedTotalPages) => {
  mockTransaction.mockResolvedValue([total, []]);

  const result = await getAllUsers(buildInput({ itemsPerPage }));

  expect(result).toEqual(expect.objectContaining({ total, totalPages: expectedTotalPages }));
});

/* - Testando as falhas do banco - */

test("should return false when the transaction fails", async () => {
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await getAllUsers(buildInput());

  expect(result).toBe(false);
});
