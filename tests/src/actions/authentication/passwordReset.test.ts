import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { passwordReset } from "@/actions/authentication/passwordReset";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { hash } from "@/lib/server/services/bcrypt";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/services/bcrypt", () => ({ hash: vi.fn(), compare: vi.fn() }));

const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockHash = hash as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;
const mockUpdateUser = prisma.user.update as unknown as Mock;
const mockUpdateManySessions = prisma.session.updateMany as unknown as Mock;
const mockDeleteManySessions = prisma.session.deleteMany as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;

/* - Funções e dados auxiliares - */

type PasswordResetInput = Parameters<typeof passwordReset>[0];

const token = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildInput = (overrides: Partial<PasswordResetInput> = {}): PasswordResetInput => ({
  token,
  password: "novaSenha123",
  confirmPassword: "novaSenha123",
  ...overrides,
});

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  token,
  tokenExpiresAt: new Date(now.getTime() + 10 * 60 * 1000),
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockFindUniqueUser.mockResolvedValue(buildDbUser());
  mockHash.mockResolvedValue("hashed password");
  mockTransaction.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a validação - */

test.each([
  ["a token that is not a uuid", { token: "not-a-uuid" }],
  ["an empty token", { token: "" }],
  ["a password under 6 characters", { password: "12345", confirmPassword: "12345" }],
  ["a password over 30 characters", { password: "a".repeat(31), confirmPassword: "a".repeat(31) }],
  ["a confirmation that does not match the password", { confirmPassword: "outraSenha123" }],
  ["no confirmation", { confirmPassword: undefined }],
])("should return false and skip the rate limit and the database when the input has %s", async (_description, invalidInput) => {
  const result = await passwordReset(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should check the rate limit of 10 attempts every 15 minutes", async () => {
  await passwordReset(buildInput());

  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "pwd-reset", limit: 10, windowSeconds: 15 * 60 });
});

test("should return too_many_attempts and skip the database when the rate limit is exceeded", async () => {
  mockCheckRateLimit.mockResolvedValue({ allowed: false });

  const result = await passwordReset(buildInput());

  expect(result).toBe("too_many_attempts");
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockHash).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando o token - */

test("should look for the user by the token", async () => {
  await passwordReset(buildInput());

  expect(mockFindUniqueUser).toHaveBeenCalledWith({ where: { token } });
});

test.each([
  ["the token does not belong to any user", null],
  ["the user has no token expiration", buildDbUser({ tokenExpiresAt: null })],
  ["the token is expired", buildDbUser({ tokenExpiresAt: new Date(now.getTime() - 1) })],
])("should return false and skip the hash and the transaction when %s", async (_description, user) => {
  mockFindUniqueUser.mockResolvedValue(user);

  const result = await passwordReset(buildInput());

  expect(result).toBe(false);
  expect(mockHash).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

/* - Testando a troca de senha - */

test("should hash the new password with 10 salt rounds", async () => {
  await passwordReset(buildInput({ password: "outraSenha1", confirmPassword: "outraSenha1" }));

  expect(mockHash).toHaveBeenCalledWith("outraSenha1", 10);
});

test("should save the hashed password and clear the token and its expiration", async () => {
  await passwordReset(buildInput());

  expect(mockUpdateUser).toHaveBeenCalledWith({
    where: { token },
    data: { password: "hashed password", token: null, tokenExpiresAt: null },
  });
});

test("should revoke and delete every session of the user", async () => {
  await passwordReset(buildInput());

  expect(mockUpdateManySessions).toHaveBeenCalledWith({ where: { userId: "user 1", revokedAt: null }, data: { revokedAt: now } });
  expect(mockDeleteManySessions).toHaveBeenCalledWith({ where: { userId: "user 1" } });
});

test("should run the password change and the session cleanup inside a single transaction", async () => {
  await passwordReset(buildInput());

  expect(mockTransaction).toHaveBeenCalledTimes(1);
  expect(mockTransaction.mock.calls[0][0]).toHaveLength(3);
});

test("should return true when the password is changed", async () => {
  const result = await passwordReset(buildInput());

  expect(result).toBe(true);
});

/* - Testando as falhas - */

test.each([
  ["hashing the password", () => mockHash],
  ["running the transaction", () => mockTransaction],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await passwordReset(buildInput());

  expect(result).toBe(false);
});
