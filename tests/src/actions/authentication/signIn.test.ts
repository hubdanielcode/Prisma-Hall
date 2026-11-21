import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { signIn } from "@/actions/authentication/signIn";
import { checkRateLimit, resetRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { compare, hash } from "@/lib/server/services/bcrypt";
import { cookies } from "next/headers";
import { createSession } from "@/lib/server/authentication/createSession";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/services/bcrypt", () => ({ hash: vi.fn(), compare: vi.fn() }));
vi.mock("@/lib/server/authentication/createSession", () => ({ createSession: vi.fn() }));

const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockResetRateLimit = resetRateLimit as unknown as Mock;
const mockCompare = compare as unknown as Mock;
const mockHash = hash as unknown as Mock;
const mockCookies = cookies as unknown as Mock;
const mockCreateSession = createSession as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;
const mockFindUniqueSession = prisma.session.findUnique as unknown as Mock;
const mockUpdateSession = prisma.session.update as unknown as Mock;
const mockCookieGet = vi.fn();
const mockCookieSet = vi.fn();

/* - Funções e dados auxiliares - */

type SignInInput = Parameters<typeof signIn>[0];

const now = new Date("2026-01-15T18:00:00.000Z");
const twoHours = 60 * 60 * 2 * 1000;
const sevenDays = 60 * 60 * 24 * 7 * 1000;

const buildInput = (overrides: Partial<SignInInput> = {}): SignInInput => ({
  typedEmail: "maria@gmail.com",
  typedPassword: "123456",
  rememberMe: false,
  ...overrides,
});

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  name: "Maria Silva",
  email: "maria@gmail.com",
  password: "hashed password",
  role: "user",
  validatedAt: new Date("2026-01-10T12:00:00.000Z"),
  needsRevalidation: false,
  ...overrides,
});

const buildDbSession = (overrides: Record<string, unknown> = {}) => ({
  id: "session 1",
  userId: "user 1",
  revokedAt: null,
  expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  ...overrides,
});

const blockAction = (blockedAction: string) => {
  mockCheckRateLimit.mockImplementation(async ({ action }: { action: string }) => ({ allowed: action !== blockedAction }));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockResetRateLimit.mockResolvedValue(undefined);
  mockHash.mockResolvedValue("dummy hash");
  mockCompare.mockResolvedValue(true);
  mockCookies.mockResolvedValue({ get: mockCookieGet, set: mockCookieSet });
  mockCookieGet.mockReturnValue(undefined);
  mockFindUniqueUser.mockResolvedValue(buildDbUser());
  mockFindUniqueSession.mockResolvedValue(null);
  mockUpdateSession.mockResolvedValue({});
  mockCreateSession.mockResolvedValue({ id: "new session" });
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a validação - */

test.each([
  ["an empty e-mail", { typedEmail: "" }],
  ["an e-mail that is not valid", { typedEmail: "maria" }],
  ["an empty password", { typedPassword: "" }],
])("should return false and skip the rate limit and the database when the input has %s", async (_description, invalidInput) => {
  const result = await signIn(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should check the rate limit by account and by IP", async () => {
  await signIn(buildInput());

  expect(mockCheckRateLimit).toHaveBeenCalledTimes(2);
  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "signIn",
    identifier: "maria@gmail.com",
    limit: 10,
    windowSeconds: 15 * 60,
    includeIp: false,
  });
  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "signIn-ip", limit: 30, windowSeconds: 15 * 60 });
});

test.each([
  ["the account limit", "signIn"],
  ["the IP limit", "signIn-ip"],
])("should return too_many_attempts and skip the database when %s is exceeded", async (_description, blockedAction) => {
  blockAction(blockedAction);

  const result = await signIn(buildInput());

  expect(result).toBe("too_many_attempts");
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockCompare).not.toHaveBeenCalled();
});

/* - Testando e-mail inexistente - */

test("should look for the user by e-mail", async () => {
  await signIn(buildInput());

  expect(mockFindUniqueUser).toHaveBeenCalledWith({ where: { email: "maria@gmail.com" } });
});

test("should compare the password with a dummy hash and return false when the e-mail does not exist", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  const result = await signIn(buildInput());

  expect(result).toBe(false);
  expect(mockCompare).toHaveBeenCalledTimes(1);
  expect(mockCompare).toHaveBeenCalledWith("123456", "dummy hash");
  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
});

test("should calculate the dummy hash only once, no matter how many unknown e-mails are tried", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  await signIn(buildInput());
  await signIn(buildInput());
  await signIn(buildInput());

  // O hash falso fica guardado no módulo, então no máximo a primeira chamada de todo o arquivo o calcula

  expect(mockHash.mock.calls.length).toBeLessThanOrEqual(1);
  expect(mockCompare).toHaveBeenCalledTimes(3);
});

/* - Testando a senha - */

test("should compare the typed password with the stored hash", async () => {
  await signIn(buildInput({ typedPassword: "minhaSenha" }));

  expect(mockCompare).toHaveBeenCalledWith("minhaSenha", "hashed password");
});

test("should return false and skip the session when the password is wrong", async () => {
  mockCompare.mockResolvedValue(false);

  const result = await signIn(buildInput());

  expect(result).toBe(false);
  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
  expect(mockResetRateLimit).not.toHaveBeenCalled();
});

/* - Testando conta sem validação - */

test.each([
  ["the account was never validated", { validatedAt: null, needsRevalidation: false }],
  ["the account needs a new validation", { needsRevalidation: true }],
])("should return account_not_validated and skip the session when %s", async (_description, overrides) => {
  mockFindUniqueUser.mockResolvedValue(buildDbUser(overrides));

  const result = await signIn(buildInput());

  expect(result).toBe("account_not_validated");
  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).not.toHaveBeenCalled();
});

test("should return false, and not account_not_validated, when the password is wrong and the account is not validated", async () => {
  mockCompare.mockResolvedValue(false);
  mockFindUniqueUser.mockResolvedValue(buildDbUser({ validatedAt: null }));

  const result = await signIn(buildInput());

  expect(result).toBe(false);
});

/* - Testando a criação da sessão - */

test("should read the validSession cookie", async () => {
  await signIn(buildInput());

  expect(mockCookieGet).toHaveBeenCalledWith("validSession");
});

test("should create a new session when there is no session cookie", async () => {
  await signIn(buildInput());

  expect(mockFindUniqueSession).not.toHaveBeenCalled();
  expect(mockCreateSession).toHaveBeenCalledWith({ userId: "user 1", expiresAt: new Date(now.getTime() + twoHours) });
  expect(mockUpdateSession).not.toHaveBeenCalled();
});

test.each([
  ["the session of the cookie does not exist", null],
  ["the session of the cookie is revoked", buildDbSession({ revokedAt: new Date("2026-01-15T17:00:00.000Z") })],
  ["the session of the cookie is expired", buildDbSession({ expiresAt: new Date(now.getTime() - 1) })],
  ["the session of the cookie belongs to another user", buildDbSession({ userId: "user 2" })],
])("should create a new session when %s", async (_description, session) => {
  mockCookieGet.mockReturnValue({ value: "session 1" });
  mockFindUniqueSession.mockResolvedValue(session);

  await signIn(buildInput());

  expect(mockFindUniqueSession).toHaveBeenCalledWith({ where: { id: "session 1" } });
  expect(mockCreateSession).toHaveBeenCalledTimes(1);
  expect(mockUpdateSession).not.toHaveBeenCalled();
  expect(mockCookieSet).toHaveBeenCalledWith("validSession", "new session", expect.any(Object));
});

test("should reuse the active session of the same user and renew its activity and expiration", async () => {
  mockCookieGet.mockReturnValue({ value: "session 1" });
  mockFindUniqueSession.mockResolvedValue(buildDbSession());

  await signIn(buildInput());

  expect(mockCreateSession).not.toHaveBeenCalled();
  expect(mockUpdateSession).toHaveBeenCalledWith({
    where: { id: "session 1" },
    data: { lastActivityAt: now, expiresAt: new Date(now.getTime() + twoHours) },
  });
  expect(mockCookieSet).toHaveBeenCalledWith("validSession", "session 1", expect.any(Object));
});

/* - Testando o tempo de sessão e o cookie - */

test.each([
  ["2 hours when remember me is off", false, twoHours],
  ["7 days when remember me is on", true, sevenDays],
])("should make the session last %s", async (_description, rememberMe, duration) => {
  const expiresAt = new Date(now.getTime() + duration);

  await signIn(buildInput({ rememberMe }));

  expect(mockCreateSession).toHaveBeenCalledWith({ userId: "user 1", expiresAt });
  expect(mockCookieSet).toHaveBeenCalledWith("validSession", "new session", expect.objectContaining({ expires: expiresAt }));
});

test("should set the session cookie as http only, secure and lax", async () => {
  await signIn(buildInput());

  expect(mockCookieSet).toHaveBeenCalledWith("validSession", "new session", {
    httpOnly: true,
    secure: true,
    expires: new Date(now.getTime() + twoHours),
    sameSite: "lax",
  });
});

/* - Testando o resultado - */

test("should reset the failed attempts of the account after a successful sign in", async () => {
  await signIn(buildInput());

  expect(mockResetRateLimit).toHaveBeenCalledWith("signIn", "maria@gmail.com", false);
});

test("should return the user without the password and the validation fields", async () => {
  const result = await signIn(buildInput());

  expect(result).toEqual({ id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" });
});

/* - Testando as falhas - */

test.each([
  ["looking for the session of the cookie", () => mockFindUniqueSession],
  ["setting the cookie", () => mockCookieSet],
  ["updating the active session", () => mockUpdateSession],
])("should return false when %s fails", async (_description, getMock) => {
  mockCookieGet.mockReturnValue({ value: "session 1" });
  mockFindUniqueSession.mockResolvedValue(buildDbSession());
  getMock().mockImplementation(() => {
    throw new Error("error");
  });

  const result = await signIn(buildInput());

  expect(result).toBe(false);
});

test("should return false and set no cookie when creating a new session fails", async () => {
  mockCreateSession.mockRejectedValue(new Error("db error"));

  const result = await signIn(buildInput());

  expect(result).toBe(false);
  expect(mockCookieSet).not.toHaveBeenCalled();
  expect(mockResetRateLimit).not.toHaveBeenCalled();
});
