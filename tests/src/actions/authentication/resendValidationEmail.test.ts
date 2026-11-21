import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { resendValidationEmail } from "@/actions/authentication/resendValidationEmail";
import { after } from "next/server";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { prisma } from "@/lib/server/services/prisma";
import { renewValidationBrowser } from "@/lib/server/authentication/validationBrowser";
import { sendValidationEmail } from "@/lib/server/users/sendValidationEmail";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/authentication/validationBrowser", () => ({
  clearValidationBrowserCookie: vi.fn(),
  doesValidationBrowserMatch: vi.fn(),
  readValidationBrowserHash: vi.fn(),
  renewValidationBrowser: vi.fn(),
  startValidationBrowser: vi.fn(),
}));
vi.mock("@/lib/server/users/sendValidationEmail", () => ({ sendValidationEmail: vi.fn() }));

const mockAfter = after as unknown as Mock;
const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockRenewValidationBrowser = renewValidationBrowser as unknown as Mock;
const mockSendValidationEmail = sendValidationEmail as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const email = "maria@gmail.com";

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  name: "Maria Silva",
  email,
  validatedAt: null,
  needsRevalidation: false,
  ...overrides,
});

// Como o after é mockado, o trabalho que ele agenda só roda quando o teste chama esta função

const runAfterCallback = async () => {
  await mockAfter.mock.calls[0][0]();
};

const blockAction = (blockedAction: string) => {
  mockCheckRateLimit.mockImplementation(async ({ action }: { action: string }) => ({ allowed: action !== blockedAction }));
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockRenewValidationBrowser.mockResolvedValue("browser hash");
  mockFindUniqueUser.mockResolvedValue(buildDbUser());
  mockSendValidationEmail.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* - Testando a validação - */

test.each([
  ["an empty e-mail", ""],
  ["an e-mail without the at sign", "mariagmail.com"],
  ["an e-mail over 50 characters", `${"a".repeat(45)}@gmail.com`],
  ["a value that is not a string", 123],
])("should return false and skip the rate limit and the database when the input is %s", async (_description, invalidEmail) => {
  const result = await resendValidationEmail(invalidEmail as never);

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockAfter).not.toHaveBeenCalled();
});

/* - Testando o intervalo mínimo entre os envios - */

test("should check the cooldown of one send every 60 seconds for the e-mail", async () => {
  await resendValidationEmail(email);

  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "validation-cooldown",
    identifier: email,
    limit: 1,
    windowSeconds: 60,
    includeIp: false,
  });
});

test("should return too_soon and skip the other limits and the database when the cooldown is active", async () => {
  blockAction("validation-cooldown");

  const result = await resendValidationEmail(email);

  expect(result).toBe("too_soon");
  expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
  expect(mockRenewValidationBrowser).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
});

/* - Testando o limite por hora - */

test("should check the limit of 4 sends per hour by e-mail and by IP", async () => {
  await resendValidationEmail(email);

  expect(mockCheckRateLimit).toHaveBeenCalledTimes(3);
  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "validation-request",
    identifier: email,
    limit: 4,
    windowSeconds: 60 * 60,
    includeIp: false,
  });
  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "validation-request-ip", limit: 4, windowSeconds: 60 * 60 });
});

test.each([
  ["the e-mail limit", "validation-request"],
  ["the IP limit", "validation-request-ip"],
])("should return too_many_attempts and skip the database when %s is exceeded", async (_description, blockedAction) => {
  blockAction(blockedAction);

  const result = await resendValidationEmail(email);

  expect(result).toBe("too_many_attempts");
  expect(mockRenewValidationBrowser).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockAfter).not.toHaveBeenCalled();
});

/* - Testando a amarração com o navegador - */

test("should renew the validation browser and look for the user by e-mail", async () => {
  await resendValidationEmail(email);

  expect(mockRenewValidationBrowser).toHaveBeenCalledTimes(1);
  expect(mockFindUniqueUser).toHaveBeenCalledWith({ where: { email } });
});

test("should keep going with a null hash when renewing the validation browser fails", async () => {
  mockRenewValidationBrowser.mockRejectedValue(new Error("cookie error"));

  const result = await resendValidationEmail(email);
  await runAfterCallback();

  expect(result).toBe(true);
  expect(mockSendValidationEmail).toHaveBeenCalledWith(expect.objectContaining({ validationBrowserHash: null }));
});

/* - Testando e-mail inexistente ou conta já validada - */

test("should return true and schedule nothing when the e-mail does not exist, so it does not reveal anything", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  const result = await resendValidationEmail(email);

  expect(result).toBe(true);
  expect(mockAfter).not.toHaveBeenCalled();
  expect(mockSendValidationEmail).not.toHaveBeenCalled();
});

test("should return true and schedule nothing when the account is already validated", async () => {
  mockFindUniqueUser.mockResolvedValue(buildDbUser({ validatedAt: new Date("2026-01-10T12:00:00.000Z"), needsRevalidation: false }));

  const result = await resendValidationEmail(email);

  expect(result).toBe(true);
  expect(mockAfter).not.toHaveBeenCalled();
  expect(mockSendValidationEmail).not.toHaveBeenCalled();
});

/* - Testando o envio - */

test.each([
  ["the account was never validated", { validatedAt: null, needsRevalidation: false }],
  ["the account needs a new validation", { validatedAt: new Date("2026-01-10T12:00:00.000Z"), needsRevalidation: true }],
])("should return true and schedule the e-mail to run after the response when %s", async (_description, overrides) => {
  mockFindUniqueUser.mockResolvedValue(buildDbUser(overrides));

  const result = await resendValidationEmail(email);

  expect(result).toBe(true);
  expect(mockAfter).toHaveBeenCalledTimes(1);
  expect(mockSendValidationEmail).not.toHaveBeenCalled();
});

test("should send the validation e-mail with the user data and the browser hash", async () => {
  await resendValidationEmail(email);
  await runAfterCallback();

  expect(mockSendValidationEmail).toHaveBeenCalledTimes(1);
  expect(mockSendValidationEmail).toHaveBeenCalledWith({ userId: "user 1", name: "Maria Silva", email, validationBrowserHash: "browser hash" });
});

test("should only log the error when sending the e-mail fails", async () => {
  const error = new Error("send error");

  mockSendValidationEmail.mockRejectedValue(error);

  const result = await resendValidationEmail(email);

  expect(result).toBe(true);
  await expect(runAfterCallback()).resolves.toBeUndefined();
  expect(console.error).toHaveBeenCalledWith("[validation-email] resend:", error);
});
