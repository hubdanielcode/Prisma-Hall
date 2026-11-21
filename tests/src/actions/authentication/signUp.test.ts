import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { signUp } from "@/actions/authentication/signUp";
import { after } from "next/server";
import { checkRateLimit } from "@/lib/server/rate-limit/rateLimiter";
import { hash } from "@/lib/server/services/bcrypt";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { sendValidationEmail } from "@/lib/server/users/sendValidationEmail";
import { startValidationBrowser } from "@/lib/server/authentication/validationBrowser";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@/lib/server/rate-limit/rateLimiter", () => ({ checkRateLimit: vi.fn(), resetRateLimit: vi.fn() }));
vi.mock("@/lib/server/services/bcrypt", () => ({ hash: vi.fn(), compare: vi.fn() }));
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
const mockHash = hash as unknown as Mock;
const mockStartValidationBrowser = startValidationBrowser as unknown as Mock;
const mockSendValidationEmail = sendValidationEmail as unknown as Mock;
const mockCreateUser = prisma.user.create as unknown as Mock;

/* - Funções e dados auxiliares - */

type SignUpInput = Parameters<typeof signUp>[0];

// Ajuste os valores inválidos conforme as regras do signUpSchema

const buildInput = (overrides: Partial<SignUpInput> = {}): SignUpInput => ({
  name: "Maria Silva",
  email: "maria@gmail.com",
  password: "123456",
  confirmPassword: "123456",
  ...overrides,
});

const dbUser = { id: "user 1", name: "Maria Silva", email: "maria@gmail.com" };

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

// Como o after é mockado, o trabalho que ele agenda só roda quando o teste chama esta função

const runAfterCallback = async () => {
  await mockAfter.mock.calls[0][0]();
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockHash.mockResolvedValue("hashed password");
  mockStartValidationBrowser.mockResolvedValue("browser hash");
  mockSendValidationEmail.mockResolvedValue(undefined);
  mockCreateUser.mockResolvedValue(dbUser);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* - Testando a validação - */

test.each([
  ["an empty name", { name: "" }],
  ["a name without surname", { name: "Maria" }],
  ["a name with numbers", { name: "Maria Silva 2" }],
  ["a name over 50 characters", { name: `Maria ${"a".repeat(50)}` }],
  ["an e-mail that is not valid", { email: "maria" }],
  ["an e-mail from a domain that is not allowed", { email: "maria@empresa.com" }],
  ["an e-mail with a local part under 2 characters", { email: "m@gmail.com" }],
  ["an e-mail over 50 characters", { email: `${"a".repeat(45)}@gmail.com` }],
  ["a password under 6 characters", { password: "12345", confirmPassword: "12345" }],
  ["a password over 30 characters", { password: "a".repeat(31), confirmPassword: "a".repeat(31) }],
  ["a confirmation that does not match the password", { confirmPassword: "654321" }],
])("should return false and skip the rate limit and the database when the input has %s", async (_description, invalidInput) => {
  const result = await signUp(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockHash).not.toHaveBeenCalled();
  expect(mockCreateUser).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should check the rate limit of 5 sign ups per hour by IP", async () => {
  await signUp(buildInput());

  expect(mockCheckRateLimit).toHaveBeenCalledWith({ action: "signUp", limit: 5, windowSeconds: 60 * 60 });
});

test("should return too_many_attempts and skip the hash and the database when the rate limit is exceeded", async () => {
  mockCheckRateLimit.mockResolvedValue({ allowed: false });

  const result = await signUp(buildInput());

  expect(result).toBe("too_many_attempts");
  expect(mockHash).not.toHaveBeenCalled();
  expect(mockCreateUser).not.toHaveBeenCalled();
  expect(mockAfter).not.toHaveBeenCalled();
});

/* - Testando a criação do usuário - */

test("should hash the password with 10 salt rounds", async () => {
  await signUp(buildInput({ password: "outraSenha1", confirmPassword: "outraSenha1" }));

  expect(mockHash).toHaveBeenCalledWith("outraSenha1", 10);
});

test("should create the user with the hashed password and without the confirmation", async () => {
  await signUp(buildInput());

  expect(mockCreateUser).toHaveBeenCalledWith({
    data: { name: "Maria Silva", email: "maria@gmail.com", password: "hashed password" },
  });
});

/* - Testando os limites de reenvio do e-mail de validação - */

test("should count the sign up e-mail as the first send in the resend limits", async () => {
  await signUp(buildInput());

  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "validation-cooldown",
    identifier: "maria@gmail.com",
    limit: 1,
    windowSeconds: 60,
    includeIp: false,
  });
  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "validation-request",
    identifier: "maria@gmail.com",
    limit: 4,
    windowSeconds: 60 * 60,
    includeIp: false,
  });
});

/* - Testando o e-mail de validação - */

test("should return true and schedule the e-mail to run after the response", async () => {
  const result = await signUp(buildInput());

  expect(result).toBe(true);
  expect(mockAfter).toHaveBeenCalledTimes(1);
  expect(mockSendValidationEmail).not.toHaveBeenCalled();
});

test("should send the validation e-mail with the user data and the browser hash", async () => {
  await signUp(buildInput());
  await runAfterCallback();

  expect(mockSendValidationEmail).toHaveBeenCalledWith({
    userId: "user 1",
    name: "Maria Silva",
    email: "maria@gmail.com",
    validationBrowserHash: "browser hash",
  });
});

test("should still create the account and send the e-mail with a null hash when starting the validation browser fails", async () => {
  mockStartValidationBrowser.mockRejectedValue(new Error("cookie error"));

  const result = await signUp(buildInput());
  await runAfterCallback();

  expect(result).toBe(true);
  expect(mockSendValidationEmail).toHaveBeenCalledWith(expect.objectContaining({ validationBrowserHash: null }));
});

test("should only log the error and still return true when sending the e-mail fails", async () => {
  const error = new Error("send error");

  mockSendValidationEmail.mockRejectedValue(error);

  const result = await signUp(buildInput());

  expect(result).toBe(true);
  await expect(runAfterCallback()).resolves.toBeUndefined();
  expect(console.error).toHaveBeenCalledWith("[validation-email] signUp:", error);
});

/* - Testando as falhas do banco - */

test("should return email_is_not_unique when the e-mail already exists", async () => {
  mockCreateUser.mockRejectedValue(buildPrismaError("P2002", { target: ["email"] }));

  const result = await signUp(buildInput());

  expect(result).toBe("email_is_not_unique");
  expect(mockAfter).not.toHaveBeenCalled();
});

test.each([
  ["a unique error from another field", buildPrismaError("P2002", { target: ["name"] })],
  ["a prisma error that is not a unique constraint", buildPrismaError("P2025", { target: ["email"] })],
  ["an unknown error", new Error("db error")],
])("should return false and send no e-mail when creating the user fails with %s", async (_description, error) => {
  mockCreateUser.mockRejectedValue(error);

  const result = await signUp(buildInput());

  expect(result).toBe(false);
  expect(mockAfter).not.toHaveBeenCalled();
  expect(mockSendValidationEmail).not.toHaveBeenCalled();
});

test("should return false and skip the database when hashing the password fails", async () => {
  mockHash.mockRejectedValue(new Error("hash error"));

  const result = await signUp(buildInput());

  expect(result).toBe(false);
  expect(mockCreateUser).not.toHaveBeenCalled();
});
