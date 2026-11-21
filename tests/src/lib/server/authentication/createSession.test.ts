import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { createSession } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

const mockDeleteMany = prisma.session.deleteMany as unknown as Mock;
const mockCreate = prisma.session.create as unknown as Mock;

/* - Funções e dados auxiliares - */

const userId = "7f9c2b1e-3a4d-4c8e-9b6a-1d2e3f4a5b6c";
const now = new Date("2026-06-15T12:00:00.000Z");
const futureDate = new Date("2099-01-01T00:00:00.000Z");

const buildDatabaseSession = (overrides: Record<string, unknown> = {}) => ({
  id: "session 1",
  userId,
  expiresAt: futureDate,
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  mockDeleteMany.mockResolvedValue({ count: 0 });
  mockCreate.mockResolvedValue(buildDatabaseSession());
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a limpeza das sessões expiradas - */

test("should delete only the expired sessions of the user", async () => {
  await createSession({ userId, expiresAt: futureDate });

  expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId, expiresAt: { lt: now } } });
});

test("should clean the expired sessions before creating the new one", async () => {
  await createSession({ userId, expiresAt: futureDate });

  expect(mockDeleteMany.mock.invocationCallOrder[0]).toBeLessThan(mockCreate.mock.invocationCallOrder[0]);
});

/* - Testando a consulta ao banco - */

test("should create the session with the user id and the expiration date", async () => {
  await createSession({ userId, expiresAt: futureDate });

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockCreate).toHaveBeenCalledWith({ data: { userId, expiresAt: futureDate } });
});

/* - Testando o resultado - */

test("should return the session created by the database", async () => {
  const result = await createSession({ userId, expiresAt: futureDate });

  expect(result).toEqual(buildDatabaseSession());
});

/* - Testando as falhas do banco - */

test("should reject and skip the creation when cleaning the expired sessions fails", async () => {
  mockDeleteMany.mockRejectedValue(new Error("db error"));

  await expect(createSession({ userId, expiresAt: futureDate })).rejects.toThrow("db error");
  expect(mockCreate).not.toHaveBeenCalled();
});

test("should reject when creating the session fails", async () => {
  mockCreate.mockRejectedValue(new Error("db error"));

  await expect(createSession({ userId, expiresAt: futureDate })).rejects.toThrow("db error");
});
