import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { sendValidationEmail } from "@/lib/server/users/sendValidationEmail";
import { getResend } from "@/lib/server/services/resend";
import { ValidateAccountEmail } from "@/shared/emails/ValidateAccountEmail";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

vi.mock("@/lib/server/services/resend", () => ({ getResend: vi.fn() }));
vi.mock("@/shared/emails/ValidateAccountEmail", () => ({ ValidateAccountEmail: vi.fn() }));

const mockGetResend = getResend as unknown as Mock;
const mockUpdateUser = prisma.user.update as unknown as Mock;
const mockSend = vi.fn();

/* - Funções e dados auxiliares - */

type SendValidationEmailInput = Parameters<typeof sendValidationEmail>[0];

const token = "550e8400-e29b-41d4-a716-446655440000";
const appUrl = "https://prismahall.com";
const now = new Date("2026-01-15T18:00:00.000Z");
const expiresAt = new Date("2026-01-15T18:15:00.000Z");
const validationLink = `${appUrl}/validar-conta?token=${token}`;

const buildInput = (overrides: Partial<SendValidationEmailInput> = {}): SendValidationEmailInput => ({
  userId: "user 1",
  name: "Maria",
  email: "maria@gmail.com",
  validationBrowserHash: "browser hash",
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);
  vi.stubEnv("EMAIL_FROM", undefined);
  vi.spyOn(crypto, "randomUUID").mockReturnValue(token);

  mockUpdateUser.mockResolvedValue({});
  mockGetResend.mockReturnValue({ emails: { send: mockSend } });
  mockSend.mockResolvedValue({ data: { id: "email 1" }, error: null });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/* - Testando a consulta ao banco - */

test("should save a new token that expires in 15 minutes and the browser hash in the user", async () => {
  await sendValidationEmail(buildInput());

  expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  expect(mockUpdateUser).toHaveBeenCalledWith({
    where: { id: "user 1" },
    data: { validationToken: token, validationTokenExpiresAt: expiresAt, validationBrowserHash: "browser hash" },
  });
});

test.each([
  ["undefined", undefined],
  ["null", null],
])("should save the browser hash as null when it is %s", async (_description, validationBrowserHash) => {
  await sendValidationEmail(buildInput({ validationBrowserHash }));

  expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ validationBrowserHash: null }) }));
});

/* - Testando o envio do e-mail - */

test("should send the validation email with the link to the user", async () => {
  await sendValidationEmail(buildInput());

  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend).toHaveBeenCalledWith({
    from: "Prisma Hall <onboarding@resend.dev>",
    to: "maria@gmail.com",
    subject: "Valide a sua conta no Prisma Hall",
    text: `Olá, Maria! Para validar a sua conta, acesse o link: ${validationLink}`,
    react: expect.objectContaining({ type: ValidateAccountEmail, props: { name: "Maria", validationLink } }),
  });
});

test("should send the email from the address in EMAIL_FROM when it is set", async () => {
  vi.stubEnv("EMAIL_FROM", "Prisma Hall <contato@prismahall.com>");

  await sendValidationEmail(buildInput());

  expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ from: "Prisma Hall <contato@prismahall.com>" }));
});

test("should build the validation link with the app url and the new token", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

  await sendValidationEmail(buildInput());

  expect(mockSend).toHaveBeenCalledWith(
    expect.objectContaining({
      react: expect.objectContaining({ props: { name: "Maria", validationLink: `http://localhost:3000/validar-conta?token=${token}` } }),
    }),
  );
});

test("should save the token in the database before sending the email", async () => {
  await sendValidationEmail(buildInput());

  expect(mockUpdateUser.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
});

/* - Testando o resultado - */

test("should resolve without a value when the email was sent", async () => {
  await expect(sendValidationEmail(buildInput())).resolves.toBeUndefined();
});

/* - Testando as falhas do banco e do envio - */

test("should throw and skip the email when the database fails", async () => {
  mockUpdateUser.mockRejectedValue(new Error("db error"));

  await expect(sendValidationEmail(buildInput())).rejects.toThrow("db error");
  expect(mockSend).not.toHaveBeenCalled();
});

test("should throw with the name and the message of the error when Resend refuses the email", async () => {
  mockSend.mockResolvedValue({ data: null, error: { name: "validation_error", message: "Domínio não verificado" } });

  await expect(sendValidationEmail(buildInput())).rejects.toThrow("Falha ao enviar o e-mail de validação: validation_error - Domínio não verificado");
});

test("should throw when sending the email rejects", async () => {
  mockSend.mockRejectedValue(new Error("network error"));

  await expect(sendValidationEmail(buildInput())).rejects.toThrow("network error");
});
