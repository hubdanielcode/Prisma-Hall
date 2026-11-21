import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { validateSession } from "@/actions/authentication/validateSession";
import { cookies } from "next/headers";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockCookies = cookies as unknown as Mock;
const mockFindUniqueSession = prisma.session.findUnique as unknown as Mock;
const mockUpdateSession = prisma.session.update as unknown as Mock;
const mockDeleteManySessions = prisma.session.deleteMany as unknown as Mock;
const mockFindUniqueUser = prisma.user.findUnique as unknown as Mock;
const mockCookieGet = vi.fn();

/* - Funções e dados auxiliares - */

const now = new Date("2026-01-15T18:00:00.000Z");
const minutes = (value: number) => value * 60 * 1000;

const buildDbSession = (overrides: Record<string, unknown> = {}) => ({
  id: "session 1",
  userId: "user 1",
  expiresAt: new Date(now.getTime() + minutes(60)),
  revokedAt: null,
  lastActivityAt: new Date(now.getTime() - minutes(1)),
  ...overrides,
});

const buildDbUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user 1",
  name: "Maria Silva",
  email: "maria@gmail.com",
  role: "user",
  validatedAt: new Date("2026-01-10T12:00:00.000Z"),
  needsRevalidation: false,
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.spyOn(Math, "random").mockReturnValue(0.5);

  mockCookies.mockResolvedValue({ get: mockCookieGet });
  mockCookieGet.mockReturnValue({ value: "session 1" });
  mockFindUniqueSession.mockResolvedValue(buildDbSession());
  mockFindUniqueUser.mockResolvedValue(buildDbUser());
  mockUpdateSession.mockResolvedValue({});
  mockDeleteManySessions.mockResolvedValue({ count: 0 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* - Testando o cookie da sessão - */

test("should return false and skip the database when there is no session cookie", async () => {
  mockCookieGet.mockReturnValue(undefined);

  const result = await validateSession();

  expect(result).toBe(false);
  expect(mockFindUniqueSession).not.toHaveBeenCalled();
});

test("should read the validSession cookie and look for the session by its value", async () => {
  mockCookieGet.mockReturnValue({ value: "session 9" });

  await validateSession();

  expect(mockCookieGet).toHaveBeenCalledWith("validSession");
  expect(mockFindUniqueSession).toHaveBeenCalledWith({ where: { id: "session 9" } });
});

/* - Testando a validade da sessão - */

test.each([
  ["the session does not exist", null],
  ["the session is expired", buildDbSession({ expiresAt: new Date(now.getTime() - 1) })],
  ["the session is revoked", buildDbSession({ revokedAt: new Date("2026-01-15T17:00:00.000Z") })],
])("should return false and skip the user lookup when %s", async (_description, session) => {
  mockFindUniqueSession.mockResolvedValue(session);

  const result = await validateSession();

  expect(result).toBe(false);
  expect(mockFindUniqueUser).not.toHaveBeenCalled();
  expect(mockUpdateSession).not.toHaveBeenCalled();
});

/* - Testando a atividade da sessão - */

test("should not write the activity when the last one was less than 5 minutes ago", async () => {
  mockFindUniqueSession.mockResolvedValue(buildDbSession({ lastActivityAt: new Date(now.getTime() - minutes(5)) }));

  await validateSession();

  expect(mockUpdateSession).not.toHaveBeenCalled();
});

test("should write the activity when the last one was more than 5 minutes ago", async () => {
  mockFindUniqueSession.mockResolvedValue(buildDbSession({ lastActivityAt: new Date(now.getTime() - minutes(5) - 1) }));

  await validateSession();

  expect(mockUpdateSession).toHaveBeenCalledWith({ where: { id: "session 1" }, data: { lastActivityAt: now } });
});

/* - Testando a limpeza de sessões - */

test("should not delete old sessions when the draw is not under 1%", async () => {
  await validateSession();

  expect(mockDeleteManySessions).not.toHaveBeenCalled();
});

test("should delete the expired and the revoked sessions when the draw is under 1%", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0.005);

  await validateSession();

  expect(mockDeleteManySessions).toHaveBeenCalledWith({
    where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }] },
  });
});

/* - Testando o usuário da sessão - */

test("should look for the user of the session selecting only the needed fields", async () => {
  await validateSession();

  expect(mockFindUniqueUser).toHaveBeenCalledWith({
    where: { id: "user 1" },
    select: { id: true, name: true, email: true, role: true, validatedAt: true, needsRevalidation: true },
  });
});

test.each([
  ["the user does not exist", null],
  ["the user was never validated", buildDbUser({ validatedAt: null })],
  ["the user needs a new validation", buildDbUser({ needsRevalidation: true })],
])("should return false when %s", async (_description, user) => {
  mockFindUniqueUser.mockResolvedValue(user);

  const result = await validateSession();

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the session and the user without the validation fields", async () => {
  const session = buildDbSession();

  mockFindUniqueSession.mockResolvedValue(session);

  const result = await validateSession();

  expect(result).toEqual({ session, user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" } });
});

/* - Testando as falhas do banco - */

test.each([
  ["looking for the session", () => mockFindUniqueSession],
  ["looking for the user", () => mockFindUniqueUser],
  ["writing the activity", () => mockUpdateSession],
])("should return false when %s fails", async (_description, getMock) => {
  mockFindUniqueSession.mockResolvedValue(buildDbSession({ lastActivityAt: new Date(now.getTime() - minutes(10)) }));
  getMock().mockRejectedValue(new Error("db error"));

  const result = await validateSession();

  expect(result).toBe(false);
});
