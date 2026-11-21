import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { subscribeToNewsletter } from "@/actions/newsletter/subscribeToNewsletter";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockUpsert = prisma.newsletter.upsert as unknown as Mock;

/* - Funções e dados auxiliares - */

type SubscribeToNewsletterInput = Parameters<typeof subscribeToNewsletter>[0];

const buildInput = (overrides: Partial<SubscribeToNewsletterInput> = {}): SubscribeToNewsletterInput => ({
  email: "maria@gmail.com",
  ...overrides,
});

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockUpsert.mockResolvedValue({});
});

/* - Testando a sessão e a validação - */

test("should return unauthenticated and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await subscribeToNewsletter(buildInput());

  expect(result).toBe("unauthenticated");
  expect(mockUpsert).not.toHaveBeenCalled();
});

test.each([
  ["an empty e-mail", { email: "" }],
  ["an e-mail that is not valid", { email: "not-an-email" }],
  ["an e-mail above 50 characters", { email: `${"a".repeat(45)}@gmail.com` }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await subscribeToNewsletter(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockUpsert).not.toHaveBeenCalled();
});

/* - Testando o e-mail da sessão - */

test.each([
  ["another e-mail", "outra@gmail.com"],
  ["the e-mail of the user with different casing", "MARIA@gmail.com"],
])("should return email_mismatch and skip the database when the input has %s", async (_description, email) => {
  const result = await subscribeToNewsletter(buildInput({ email }));

  expect(result).toBe("email_mismatch");
  expect(mockUpsert).not.toHaveBeenCalled();
});

/* - Testando a inscrição - */

test("should subscribe the user by creating the subscription or by updating the existing one", async () => {
  await subscribeToNewsletter(buildInput());

  expect(mockUpsert).toHaveBeenCalledTimes(1);
  expect(mockUpsert).toHaveBeenCalledWith({
    where: { userId_email: { userId: "user 1", email: "maria@gmail.com" } },
    update: { isSubscribed: true },
    create: { userId: "user 1", email: "maria@gmail.com", isSubscribed: true },
  });
});

test("should return true when the user is subscribed", async () => {
  const result = await subscribeToNewsletter(buildInput());

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return false when saving the subscription fails", async () => {
  mockUpsert.mockRejectedValue(new Error("db error"));

  const result = await subscribeToNewsletter(buildInput());

  expect(result).toBe(false);
});
