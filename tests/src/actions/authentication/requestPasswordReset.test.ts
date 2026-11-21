import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { requestPasswordReset } from "@/actions/authentication/requestPasswordReset";
import { after } from "next/server";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { getResend } from "@/lib/server/services/resend";
import { PasswordResetEmail } from "@/shared/emails/PasswordResetEmail";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/services/resend", () => ({ getResend: vi.fn() }));

const mockAfter = after as unknown as Mock;
const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockGetResend = getResend as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;
const mockUpdateUser = prisma.user.update as unknown as Mock;
const mockSend = vi.fn();

/* - Funções e dados auxiliares - */

const email = "maria@gmail.com";
const token = "550e8400-e29b-41d4-a716-446655440000";
const appUrl = "https://prismahall.com";
const now = new Date("2026-01-15T18:00:00.000Z");

const dbUser = { id: "user 1", email };

// Como o after é mockado, o trabalho que ele agenda só roda quando o teste chama esta função

const runAfterCallback = async () => {
  await mockAfter.mock.calls[0][0]();
};

const blockAction = (blockedAction: string) => {
  mockCheckRateLimit.mockImplementation(async ({ action }: { action: string }) => ({ allowed: action !== blockedAction }));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);
  vi.spyOn(crypto, "randomUUID").mockReturnValue(token);

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockFindUniqueUser.mockResolvedValue(dbUser);
  mockUpdateUser.mockResolvedValue({});
  mockGetResend.mockReturnValue({ emails: { send: mockSend } });
  mockSend.mockResolvedValue({ data: { id: "email 1" }, error: null });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/* - Testando a validação - */

test.each([
  ["an empty e-mail", ""],
  ["an e-mail without the at sign", "mariagmail.com"],
  ["an e-mail over 50 characters", `${"a".repeat(45)}@gmail.com`],
  ["a value that is not a string", 123],
])("should return false and skip the rate limit and the database when the input is %s", async (_description, invalidEmail) => {
  const result = await requestPasswordReset(invalidEmail as never);

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockAfter).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should check the rate limit by e-mail and by IP", async () => {
  await requestPasswordReset(email);

  expect(mockCheckRateLimit).toHaveBeenCalledTimes(2);
  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "pwd-request", identifier: email, limit: 3, windowSeconds: 60 * 60, includeIp: false });
  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "pwd-request-ip", limit: 10, windowSeconds: 60 * 60 });
});

test.each([
  ["the e-mail limit", "pwd-request"],
  ["the IP limit", "pwd-request-ip"],
])("should return too_many_attempts and skip the database when %s is exceeded", async (_description, blockedAction) => {
  blockAction(blockedAction);

  const result = await requestPasswordReset(email);

  expect(result).toBe("too_many_attempts");
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockAfter).not.toHaveBeenCalled();
});

/* - Testando e-mail inexistente - */

test("should look for the user by e-mail", async () => {
  await requestPasswordReset(email);

  expect(mockFindUniqueUser).toHaveBeenCalledWith({ where: { email } });
});

test("should return true and schedule nothing when the e-mail does not exist, so it does not reveal anything", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  const result = await requestPasswordReset(email);

  expect(result).toBe(true);
  expect(mockAfter).not.toHaveBeenCalled();
  expect(mockUpdateUser).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando e-mail existente - */

test("should return true and schedule the work to run after the response", async () => {
  const result = await requestPasswordReset(email);

  expect(result).toBe(true);
  expect(mockAfter).toHaveBeenCalledTimes(1);
  expect(mockUpdateUser).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test("should save a new token that expires in 10 minutes", async () => {
  await requestPasswordReset(email);
  await runAfterCallback();

  expect(mockUpdateUser).toHaveBeenCalledWith({
    where: { id: "user 1" },
    data: { token, tokenExpiresAt: new Date(now.getTime() + 10 * 60 * 1000) },
  });
});

test("should send the e-mail with the reset link to the user", async () => {
  await requestPasswordReset(email);
  await runAfterCallback();

  const resetLink = `${appUrl}/recuperar-senha?token=${token}`;

  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend).toHaveBeenCalledWith({
    from: "Prisma Hall <naoresponda@prismahall.com>",
    to: email,
    subject: "Redefina sua senha no Prisma Hall",
    text: expect.stringContaining(resetLink),
    react: expect.objectContaining({ type: PasswordResetEmail, props: { resetLink } }),
  });
});

test("should send the e-mail only after the token is saved", async () => {
  await requestPasswordReset(email);
  await runAfterCallback();

  expect(mockUpdateUser.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
});

/* - Testando as falhas silenciosas - */

test.each([
  ["saving the token", () => mockUpdateUser],
  ["sending the e-mail", () => mockSend],
])("should swallow the error and still have returned true when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("error"));

  const result = await requestPasswordReset(email);

  expect(result).toBe(true);
  await expect(runAfterCallback()).resolves.toBeUndefined();
});

test("should not send the e-mail when saving the token fails", async () => {
  mockUpdateUser.mockRejectedValue(new Error("db error"));

  await requestPasswordReset(email);
  await runAfterCallback();

  expect(mockSend).not.toHaveBeenCalled();
});
