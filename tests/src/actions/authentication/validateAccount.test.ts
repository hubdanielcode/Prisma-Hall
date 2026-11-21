import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { validateAccount } from "@/actions/authentication/validateAccount";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { clearValidationBrowserCookie, doesValidationBrowserMatch, readValidationBrowserHash } from "@/lib/server/authentication/validationBrowser";
import { cookies } from "next/headers";
import { createSession } from "@/lib/server/authentication/createSession";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/authentication/createSession", () => ({ createSession: vi.fn() }));
vi.mock("@/lib/server/authentication/validationBrowser", () => ({
  clearValidationBrowserCookie: vi.fn(),
  doesValidationBrowserMatch: vi.fn(),
  readValidationBrowserHash: vi.fn(),
  renewValidationBrowser: vi.fn(),
  startValidationBrowser: vi.fn(),
}));

const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockClearValidationBrowserCookie = clearValidationBrowserCookie as unknown as Mock;
const mockDoesValidationBrowserMatch = doesValidationBrowserMatch as unknown as Mock;
const mockReadValidationBrowserHash = readValidationBrowserHash as unknown as Mock;
const mockCookies = cookies as unknown as Mock;
const mockCreateSession = createSession as unknown as Mock;
const mockFindFirstUser = prisma.user.findFirst as unknown as Mock;
const mockUpdateManyUsers = prisma.user.updateMany as unknown as Mock;
const mockCookieSet = vi.fn();

/* - Funções e dados auxiliares - */

const token = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");
const firstValidation = new Date("2026-01-10T12:00:00.000Z");
const twoHours = 60 * 60 * 2 * 1000;

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  validationBrowserHash: "stored hash",
  validatedAt: null,
  needsRevalidation: false,
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockFindFirstUser.mockResolvedValue(buildDbUser());
  mockUpdateManyUsers.mockResolvedValue({ count: 1 });
  mockReadValidationBrowserHash.mockResolvedValue("browser hash");
  mockDoesValidationBrowserMatch.mockReturnValue(true);
  mockCookies.mockResolvedValue({ set: mockCookieSet });
  mockCreateSession.mockResolvedValue({ id: "new session" });
  mockClearValidationBrowserCookie.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a validação - */

test.each([
  ["an empty token", ""],
  ["a token that is not a uuid", "not-a-uuid"],
  ["a value that is not a string", 123],
])("should return false and skip the rate limit and the database when the input is %s", async (_description, invalidToken) => {
  const result = await validateAccount(invalidToken as never);

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindFirstUser).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should check the rate limit of 10 attempts every 15 minutes", async () => {
  await validateAccount(token);

  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "validate-account", limit: 10, windowSeconds: 15 * 60 });
});

test("should return too_many_attempts and skip the database when the rate limit is exceeded", async () => {
  mockCheckRateLimit.mockResolvedValue({ allowed: false });

  const result = await validateAccount(token);

  expect(result).toBe("too_many_attempts");
  expect(mockFindFirstUser).not.toHaveBeenCalled();
  expect(mockUpdateManyUsers).not.toHaveBeenCalled();
});

/* - Testando o token - */

test("should look for the user with a token that is not expired", async () => {
  await validateAccount(token);

  expect(mockFindFirstUser).toHaveBeenCalledWith({
    where: { validationToken: token, validationTokenExpiresAt: { gt: now } },
    select: { id: true, validationBrowserHash: true, validatedAt: true, needsRevalidation: true },
  });
});

test("should return false and skip the update when no user has that token", async () => {
  mockFindFirstUser.mockResolvedValue(null);

  const result = await validateAccount(token);

  expect(result).toBe(false);
  expect(mockUpdateManyUsers).not.toHaveBeenCalled();
});

/* - Testando a gravação da validação - */

test("should keep the token in the filter of the update, so the link works only once", async () => {
  await validateAccount(token);

  expect(mockUpdateManyUsers).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: "user 1", validationToken: token, validationTokenExpiresAt: { gt: now } } }),
  );
});

test("should save the first validation date, clear the token and the browser hash", async () => {
  await validateAccount(token);

  expect(mockUpdateManyUsers).toHaveBeenCalledWith({
    where: expect.any(Object),
    data: {
      validatedAt: now,
      revalidatedAt: undefined,
      needsRevalidation: false,
      validationToken: null,
      validationTokenExpiresAt: null,
      validationBrowserHash: null,
    },
  });
});

test("should keep the first validation date and save the revalidation date when the admin forced a revalidation", async () => {
  mockFindFirstUser.mockResolvedValue(buildDbUser({ validatedAt: firstValidation, needsRevalidation: true }));

  await validateAccount(token);

  expect(mockUpdateManyUsers).toHaveBeenCalledWith({
    where: expect.any(Object),
    data: expect.objectContaining({ validatedAt: firstValidation, revalidatedAt: now, needsRevalidation: false }),
  });
});

test("should not save a revalidation date when the account was already validated and does not need a new validation", async () => {
  mockFindFirstUser.mockResolvedValue(buildDbUser({ validatedAt: firstValidation, needsRevalidation: false }));

  await validateAccount(token);

  expect(mockUpdateManyUsers).toHaveBeenCalledWith({
    where: expect.any(Object),
    data: expect.objectContaining({ validatedAt: firstValidation, revalidatedAt: undefined }),
  });
});

test("should return false and skip the session when the link was already used in another place at the same time", async () => {
  mockUpdateManyUsers.mockResolvedValue({ count: 0 });

  const result = await validateAccount(token);

  expect(result).toBe(false);
  expect(mockReadValidationBrowserHash).not.toHaveBeenCalled();
  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
});

test.each([
  ["looking for the user", () => mockFindFirstUser],
  ["saving the validation", () => mockUpdateManyUsers],
])("should return false and skip the session when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await validateAccount(token);

  expect(result).toBe(false);
  expect(mockCreateSession).not.toHaveBeenCalled();
});

/* - Testando o navegador do cadastro - */

test("should compare the stored hash with the hash of the browser", async () => {
  await validateAccount(token);

  expect(mockDoesValidationBrowserMatch).toHaveBeenCalledWith({
    storedValidationBrowserHash: "stored hash",
    browserValidationBrowserHash: "browser hash",
  });
});

test("should return validated and skip the session when the link is opened in another browser", async () => {
  mockDoesValidationBrowserMatch.mockReturnValue(false);

  const result = await validateAccount(token);

  expect(result).toBe("validated");
  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
  expect(mockClearValidationBrowserCookie).not.toHaveBeenCalled();
});

/* - Testando o login automático - */

test("should create a session that lasts 2 hours when the browser is the same that signed up", async () => {
  await validateAccount(token);

  expect(mockCreateSession).toHaveBeenCalledWith({ userId: "user 1", expiresAt: new Date(now.getTime() + twoHours) });
});

test("should set the session cookie as http only, secure and lax", async () => {
  await validateAccount(token);

  expect(mockCookieSet).toHaveBeenCalledWith("validSession", "new session", {
    httpOnly: true,
    secure: true,
    expires: new Date(now.getTime() + twoHours),
    sameSite: "lax",
  });
});

test("should clear the validation browser cookie after signing the user in", async () => {
  await validateAccount(token);

  expect(mockClearValidationBrowserCookie).toHaveBeenCalledTimes(1);
});

test("should return validated_and_signed_in when the account is validated and the user is signed in", async () => {
  const result = await validateAccount(token);

  expect(result).toBe("validated_and_signed_in");
});

/* - Testando as falhas depois da validação - */

test.each([
  ["reading the browser hash", () => mockReadValidationBrowserHash],
  ["creating the session", () => mockCreateSession],
  ["setting the cookie", () => mockCookieSet],
])("should still return validated when %s fails, because the account is already validated", async (_description, getMock) => {
  getMock().mockImplementation(() => {
    throw new Error("error");
  });

  const result = await validateAccount(token);

  expect(result).toBe("validated");
  expect(mockUpdateManyUsers).toHaveBeenCalledTimes(1);
});
