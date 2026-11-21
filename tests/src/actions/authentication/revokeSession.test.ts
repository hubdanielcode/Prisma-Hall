import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { revokeSession } from "@/actions/authentication/revokeSession";
import { cookies } from "next/headers";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockCookies = cookies as unknown as Mock;
const mockValidateSession = validateSession as unknown as Mock;
const mockUpdateSession = prisma.session.update as unknown as Mock;
const mockCookieDelete = vi.fn();

/* - Funções e dados auxiliares - */

const now = new Date("2026-01-15T18:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCookies.mockResolvedValue({ delete: mockCookieDelete });
  mockValidateSession.mockResolvedValue({ session: { id: "session 1" }, user: { id: "user 1" } });
  mockUpdateSession.mockResolvedValue({});
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão - */

test("should return false and skip the database and the cookie when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await revokeSession();

  expect(result).toBe(false);
  expect(mockUpdateSession).not.toHaveBeenCalled();
  expect(mockCookieDelete).not.toHaveBeenCalled();
});

/* - Testando a revogação - */

test("should mark the current session as revoked", async () => {
  await revokeSession();

  expect(mockUpdateSession).toHaveBeenCalledWith({ where: { id: "session 1" }, data: { revokedAt: now } });
});

test("should delete the validSession cookie only after the session is revoked", async () => {
  await revokeSession();

  expect(mockCookieDelete).toHaveBeenCalledWith("validSession");
  expect(mockUpdateSession.mock.invocationCallOrder[0]).toBeLessThan(mockCookieDelete.mock.invocationCallOrder[0]);
});

test("should return true when the session is revoked", async () => {
  const result = await revokeSession();

  expect(result).toBe(true);
});

/* - Testando as falhas - */

test("should return false and keep the cookie when revoking the session fails", async () => {
  mockUpdateSession.mockRejectedValue(new Error("db error"));

  const result = await revokeSession();

  expect(result).toBe(false);
  expect(mockCookieDelete).not.toHaveBeenCalled();
});

test("should return false when deleting the cookie fails", async () => {
  mockCookieDelete.mockImplementation(() => {
    throw new Error("cookie error");
  });

  const result = await revokeSession();

  expect(result).toBe(false);
});
