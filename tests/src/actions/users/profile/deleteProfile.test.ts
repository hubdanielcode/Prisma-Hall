import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { deleteProfile } from "@/actions/users/profile/deleteProfile";
import { checkRateLimit, compare, prisma, resetRateLimit } from "@/lib/server";
import { makeAnonymous } from "@/lib/server/users/makeAnonymous";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));
vi.mock("@/lib/server/users/makeAnonymous", () => ({ makeAnonymous: vi.fn() }));

vi.mock("@/lib/server", async () => {
  const { prisma } = await import("@/lib/server/services/prisma");

  return { prisma, checkRateLimit: vi.fn(), resetRateLimit: vi.fn(), compare: vi.fn() };
});

const mockValidateSession = validateSession as unknown as Mock;
const mockCheckRateLimit = checkRateLimit as unknown as Mock;
const mockResetRateLimit = resetRateLimit as unknown as Mock;
const mockCompare = compare as unknown as Mock;
const mockMakeAnonymous = makeAnonymous as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const password = "senha-correta-123";
const hashedPassword = "hashed-password";

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockResetRateLimit.mockResolvedValue(undefined);
  mockFindUniqueUser.mockResolvedValue({ password: hashedPassword });
  mockCompare.mockResolvedValue(true);
  mockMakeAnonymous.mockResolvedValue(true);
});

/* - Testando a sessão e a senha digitada - */

test("should return false and skip the rate limit and the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await deleteProfile(password);

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

test.each([
  ["is empty", ""],
  ["is not a string", 123456],
  ["is null", null],
  ["is undefined", undefined],
])("should return false and skip the rate limit and the database when the password %s", async (_description, invalidPassword) => {
  const result = await deleteProfile(invalidPassword as unknown as string);

  expect(result).toBe(false);
  expect(mockCheckRateLimit).not.toHaveBeenCalled();
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

/* - Testando o limite de tentativas - */

test("should limit the attempts of the logged user to 5 every 15 minutes, without the ip", async () => {
  await deleteProfile(password);

  expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
  expect(mockCheckRateLimit).toHaveBeenCalledWith({
    action: "deleteProfile",
    identifier: "user 1",
    limit: 5,
    windowSeconds: 15 * 60,
    includeIp: false,
  });
});

test("should return too_many_attempts and skip the database when the limit was reached", async () => {
  mockCheckRateLimit.mockResolvedValue({ allowed: false });

  const result = await deleteProfile(password);

  expect(result).toBe("too_many_attempts");
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockCompare).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

/* - Testando a conferência da senha - */

test("should look for the password of the logged user and compare it with the typed one", async () => {
  await deleteProfile(password);

  expect(mockFindUniqueUser).toHaveBeenCalledWith({ where: { id: "user 1" }, select: { password: true } });
  expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
});

test("should return false and skip the anonymization when the user does not exist", async () => {
  mockFindUniqueUser.mockResolvedValue(null);

  const result = await deleteProfile(password);

  expect(result).toBe(false);
  expect(mockCompare).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

test("should return invalid_password and keep the attempts counted when the password is wrong", async () => {
  mockCompare.mockResolvedValue(false);

  const result = await deleteProfile(password);

  expect(result).toBe("invalid_password");
  expect(mockResetRateLimit).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

/* - Testando a anonimização - */

test("should reset the attempts and anonymize the logged user when the password is right", async () => {
  await deleteProfile(password);

  expect(mockResetRateLimit).toHaveBeenCalledWith("deleteProfile", "user 1", false);
  expect(mockMakeAnonymous).toHaveBeenCalledTimes(1);
  expect(mockMakeAnonymous).toHaveBeenCalledWith("user 1");
});

test("should return true when the user is anonymized", async () => {
  const result = await deleteProfile(password);

  expect(result).toBe(true);
});

test.each([
  ["false", false],
  ["a text code", "pending_orders"],
])("should return the result of the anonymization when it is %s", async (_description, anonymizationResult) => {
  mockMakeAnonymous.mockResolvedValue(anonymizationResult);

  const result = await deleteProfile(password);

  expect(result).toBe(anonymizationResult);
});

/* - Testando as falhas - */

test.each([
  ["looking for the user", () => mockFindUniqueUser],
  ["comparing the password", () => mockCompare],
  ["anonymizing the user", () => mockMakeAnonymous],
])("should return false when %s fails", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("service error"));

  const result = await deleteProfile(password);

  expect(result).toBe(false);
});
