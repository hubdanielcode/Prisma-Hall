import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { editUser } from "@/actions/admin/users-management/editUser";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockValidateSession = validateSession as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockUpdate = prisma.user.update as unknown as Mock;
const mockUpdateManySessions = prisma.session.updateMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type EditUserInput = Parameters<typeof editUser>[0];

const userId = "550e8400-e29b-41d4-a716-446655440000";
const adminId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildInput = (overrides: Partial<EditUserInput> = {}): EditUserInput => ({
  userId,
  roles: "admin",
  forceRevalidation: false,
  ...overrides,
});

const buildSession = (id: string) => ({ session: { id: "session 1" }, user: { id, name: "Admin", email: "admin@email.com", role: "admin" } });

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: userId,
  name: "Maria Silva",
  email: "maria@email.com",
  role: "admin",
  verifiedUserBadge: true,
  frequentUserBadge: "silver",
  oldUserBadge: "bronze",
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
  role: "admin",
  verifiedBadge: true,
  frequentUser: "silver",
  oldUser: "bronze",
  validatedAt: "2026-01-10T12:00:00.000Z",
  createdAt: "2026-01-09T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCheckIsAdmin.mockResolvedValue(true);
  mockValidateSession.mockResolvedValue(buildSession(adminId));
  mockUpdate.mockResolvedValue(buildDbUser());
  mockTransaction.mockResolvedValue([buildDbUser({ needsRevalidation: false }), { count: 1 }]);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando permissão e validação - */

test("should return false and skip the session and the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await editUser(buildInput());

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

// Ajuste os valores inválidos conforme as regras do editUserSchema

test.each([
  ["an id that is not a uuid", { userId: "not-a-uuid" }],
  ["an empty id", { userId: "" }],
  ["an unknown role", { roles: "invalid" }],
  ["a force revalidation that is not a boolean", { forceRevalidation: "yes" }],
  ["no field to edit", { roles: undefined, forceRevalidation: undefined }],
])("should return false and skip the session and the database when the input has %s", async (_description, invalidInput) => {
  const result = await editUser(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await editUser(buildInput());

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando a proteção contra a edição de si mesmo - */

test.each([
  ["without forcing a revalidation", { forceRevalidation: false }],
  ["forcing a revalidation", { forceRevalidation: true }],
])("should return false and skip the database when the admin tries to edit their own account %s", async (_description, overrides) => {
  mockValidateSession.mockResolvedValue(buildSession(userId));

  const result = await editUser(buildInput(overrides));

  expect(result).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando a edição sem revalidação forçada - */

test("should update only the role of the user", async () => {
  await editUser(buildInput({ roles: "user" }));

  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: userId }, data: { role: "user" } });
});

test("should not revoke any session nor use a transaction when the revalidation is not forced", async () => {
  await editUser(buildInput());

  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUpdateManySessions).not.toHaveBeenCalled();
});

test("should update the user without forcing a revalidation when forceRevalidation is not sent", async () => {
  await editUser(buildInput({ forceRevalidation: undefined }));

  expect(mockUpdate).toHaveBeenCalledWith({ where: { id: userId }, data: { role: "admin" } });
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("should return the edited user with the badge fields renamed and the dates as strings", async () => {
  const result = await editUser(buildInput());

  expect(result).toEqual(buildExpectedUser());
});

test.each([
  ["the user was never validated", { validatedAt: null, needsRevalidation: false }],
  ["the user needs a new validation", { needsRevalidation: true }],
  ["the user was never validated and needs a new validation", { validatedAt: null, needsRevalidation: true }],
])("should return a null validatedAt when %s", async (_description, overrides) => {
  mockUpdate.mockResolvedValue(buildDbUser(overrides));

  const result = await editUser(buildInput());

  expect(result).toEqual(buildExpectedUser({ validatedAt: null }));
});

test("should never return the password and the tokens", async () => {
  mockUpdate.mockResolvedValue(buildDbUser({ password: "hash", token: "token", validationToken: "validation token" }));

  const result = await editUser(buildInput());

  expect(result).not.toHaveProperty("password");
  expect(result).not.toHaveProperty("token");
  expect(result).not.toHaveProperty("validationToken");
});

/* - Testando a edição com revalidação forçada - */

test("should update the role, mark the user for revalidation and clear the validation token", async () => {
  await editUser(buildInput({ roles: "user", forceRevalidation: true }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: { role: "user", needsRevalidation: true, validationToken: null, validationTokenExpiresAt: null },
  });
});

test("should revoke only the sessions of the user that are not revoked yet", async () => {
  await editUser(buildInput({ forceRevalidation: true }));

  expect(mockUpdateManySessions).toHaveBeenCalledWith({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
});

test("should update the user and revoke the sessions inside a single transaction", async () => {
  await editUser(buildInput({ forceRevalidation: true }));

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction.mock.calls[0][0]).toHaveLength(2);
});

test("should keep the current role when the revalidation is forced and no role is sent", async () => {
  await editUser(buildInput({ roles: undefined, forceRevalidation: true }));

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: expect.objectContaining({ role: undefined, needsRevalidation: true }),
  });
});

test("should return the edited user with a null validatedAt when the revalidation is forced", async () => {
  mockTransaction.mockResolvedValue([buildDbUser({ needsRevalidation: true }), { count: 2 }]);

  const result = await editUser(buildInput({ forceRevalidation: true }));

  expect(result).toEqual(buildExpectedUser({ validatedAt: null }));
});

test("should return the edited user with the badge fields renamed and the dates as strings when the revalidation is forced", async () => {
  const result = await editUser(buildInput({ forceRevalidation: true }));

  expect(result).toEqual(buildExpectedUser());
});

/* - Testando as falhas do banco - */

test.each([
  ["updating the user", () => mockUpdate, { forceRevalidation: false }],
  ["running the transaction", () => mockTransaction, { forceRevalidation: true }],
])("should return false when %s fails", async (_description, getMock, overrides) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await editUser(buildInput(overrides));

  expect(result).toBe(false);
});
