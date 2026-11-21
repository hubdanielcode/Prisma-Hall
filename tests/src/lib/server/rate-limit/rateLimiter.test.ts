import { createHash } from "node:crypto";
import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { headers } from "next/headers";
import { checkRateLimit, resetRateLimit } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@/prisma/generated/prisma/internal/prismaNamespace";

/* - Mocks das dependências externas (next/headers; prisma vem do tests/setup.ts) - */

vi.mock("next/headers", () => ({ headers: vi.fn() }));

const mockHeaders = headers as unknown as Mock;
const mockUpdateMany = prisma.rateLimit.updateMany as unknown as Mock;
const mockCreate = prisma.rateLimit.create as unknown as Mock;
const mockFindUnique = prisma.rateLimit.findUnique as unknown as Mock;
const mockDeleteMany = prisma.rateLimit.deleteMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type CheckRateLimitInput = Parameters<typeof checkRateLimit>[0];

const now = new Date("2026-06-15T12:00:00.000Z");
const action = "login";
const identifier = "ana@example.com";
const defaultIp = "203.0.113.1";

const buildInput = (overrides: Partial<CheckRateLimitInput> = {}): CheckRateLimitInput => ({
  action,
  identifier,
  limit: 5,
  windowSeconds: 60,
  ...overrides,
});

const buildHeaders = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

const hashOf = (value: string) => createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 16);

const buildKey = (ip: string, value?: string) => `${action}:${ip}:${value ? hashOf(value) : ""}`;

const buildDatabaseRateLimit = (overrides: Record<string, unknown> = {}) => ({
  key: buildKey(defaultIp, identifier),
  count: 1,
  expiresAt: new Date("2026-06-15T12:01:00.000Z"),
  ...overrides,
});

const buildUniqueConstraintError = () => new PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "test" });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  mockHeaders.mockResolvedValue(buildHeaders({ "x-vercel-forwarded-for": defaultIp }));
  mockUpdateMany.mockResolvedValue({ count: 1 });
  mockCreate.mockResolvedValue({});
  mockFindUnique.mockResolvedValue(buildDatabaseRateLimit());
  mockDeleteMany.mockResolvedValue({ count: 0 });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando checkRateLimit: IP de quem fez a requisição - */

test.each([
  ["the first ip of x-vercel-forwarded-for, trimmed", { "x-vercel-forwarded-for": "1.1.1.1 , 2.2.2.2" }, "1.1.1.1"],
  [
    "x-vercel-forwarded-for before x-real-ip and x-forwarded-for",
    { "x-vercel-forwarded-for": "1.1.1.1", "x-real-ip": "3.3.3.3", "x-forwarded-for": "4.4.4.4" },
    "1.1.1.1",
  ],
  ["x-real-ip when there is no x-vercel-forwarded-for", { "x-real-ip": "3.3.3.3", "x-forwarded-for": "4.4.4.4" }, "3.3.3.3"],
  ["the first ip of x-forwarded-for as the last option", { "x-forwarded-for": "4.4.4.4, 5.5.5.5" }, "4.4.4.4"],
  ["unknown when there are no ip headers", {}, "unknown"],
])("should build the key with %s", async (_description, headerValues, expectedIp) => {
  mockHeaders.mockResolvedValue(buildHeaders(headerValues));

  await checkRateLimit(buildInput());

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { key: buildKey(expectedIp, identifier) } });
});

test("should not read the headers and should use unknown as the ip when includeIp is false", async () => {
  await checkRateLimit(buildInput({ includeIp: false }));

  expect(mockHeaders).not.toHaveBeenCalled();
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { key: buildKey("unknown", identifier) } });
});

/* - Testando checkRateLimit: identificador da chave - */

test("should build the key with the hash of the identifier and never with the identifier itself", async () => {
  await checkRateLimit(buildInput());

  const [{ where }] = mockFindUnique.mock.calls[0];

  expect(where.key).toBe(buildKey(defaultIp, identifier));
  expect(where.key).not.toContain(identifier);
});

test("should build the same key for identifiers that only differ in letter case", async () => {
  await checkRateLimit(buildInput({ identifier: "ANA@Example.com" }));
  await checkRateLimit(buildInput({ identifier: "ana@example.com" }));

  expect(mockFindUnique.mock.calls[0][0]).toEqual(mockFindUnique.mock.calls[1][0]);
});

test("should build the key with an empty hash when there is no identifier", async () => {
  await checkRateLimit(buildInput({ identifier: undefined }));

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { key: buildKey(defaultIp) } });
});

/* - Testando checkRateLimit: contador ativo - */

test("should add one attempt to the active counter", async () => {
  await checkRateLimit(buildInput());

  expect(mockUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockUpdateMany).toHaveBeenCalledWith({
    where: { key: buildKey(defaultIp, identifier), expiresAt: { gt: now } },
    data: { count: { increment: 1 } },
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

/* - Testando checkRateLimit: contador inexistente - */

test("should create a new counter starting at 1 and expiring after the window when there is no active counter", async () => {
  mockUpdateMany.mockResolvedValueOnce({ count: 0 });

  await checkRateLimit(buildInput({ windowSeconds: 120 }));

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockCreate).toHaveBeenCalledWith({
    data: { key: buildKey(defaultIp, identifier), count: 1, expiresAt: new Date(now.getTime() + 120 * 1000) },
  });
  expect(mockUpdateMany).toHaveBeenCalledTimes(1);
});

/* - Testando checkRateLimit: contador expirado - */

test("should restart the expired counter at 1 when the key already exists", async () => {
  mockUpdateMany.mockResolvedValueOnce({ count: 0 });
  mockCreate.mockRejectedValue(buildUniqueConstraintError());

  await checkRateLimit(buildInput({ windowSeconds: 120 }));

  expect(mockUpdateMany).toHaveBeenCalledTimes(2);
  expect(mockUpdateMany).toHaveBeenNthCalledWith(2, {
    where: { key: buildKey(defaultIp, identifier), expiresAt: { lte: now } },
    data: { count: 1, expiresAt: new Date(now.getTime() + 120 * 1000) },
  });
});

test("should add one attempt to the counter that another request just created or restarted", async () => {
  mockUpdateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 0 });
  mockCreate.mockRejectedValue(buildUniqueConstraintError());

  await checkRateLimit(buildInput());

  expect(mockUpdateMany).toHaveBeenCalledTimes(3);
  expect(mockUpdateMany).toHaveBeenNthCalledWith(3, {
    where: { key: buildKey(defaultIp, identifier) },
    data: { count: { increment: 1 } },
  });
});

test.each([
  ["a prisma error with another code", new PrismaClientKnownRequestError("Other error", { code: "P2025", clientVersion: "test" })],
  ["a generic error", new Error("db error")],
  ["an object that only looks like the unique constraint error", { code: "P2002" }],
])("should not restart the counter and should block the attempt when creating it fails with %s", async (_description, error) => {
  mockUpdateMany.mockResolvedValueOnce({ count: 0 });
  mockCreate.mockRejectedValue(error);

  const result = await checkRateLimit(buildInput());

  expect(result).toEqual({ allowed: false });
  expect(mockUpdateMany).toHaveBeenCalledTimes(1);
});

/* - Testando checkRateLimit: limite - */

test("should look for the counter by key after adding the attempt", async () => {
  await checkRateLimit(buildInput());

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { key: buildKey(defaultIp, identifier) } });
});

test.each([
  ["below the limit", 3, true],
  ["exactly the limit", 5, true],
  ["above the limit", 6, false],
])("should return allowed %s according to the count", async (_description, count, expectedAllowed) => {
  mockFindUnique.mockResolvedValue(buildDatabaseRateLimit({ count }));

  const result = await checkRateLimit(buildInput({ limit: 5 }));

  expect(result).toEqual({ allowed: expectedAllowed });
});

test.each([
  ["blocks", undefined, false],
  ["blocks", false, false],
  ["allows", true, true],
])("should %s the attempt when the counter is not found and allowOnError is %s", async (_description, allowOnError, expectedAllowed) => {
  mockFindUnique.mockResolvedValue(null);

  const result = await checkRateLimit(buildInput({ allowOnError }));

  expect(result).toEqual({ allowed: expectedAllowed });
});

/* - Testando checkRateLimit: limpeza dos contadores expirados - */

test("should delete the expired counters when the draw is below 1%", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0.005);

  await checkRateLimit(buildInput());

  expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { expiresAt: { lt: now } } });
});

test.each([
  ["exactly 1%", 0.01],
  ["above 1%", 0.5],
])("should not delete the expired counters when the draw is %s", async (_description, draw) => {
  vi.spyOn(Math, "random").mockReturnValue(draw);

  await checkRateLimit(buildInput());

  expect(mockDeleteMany).not.toHaveBeenCalled();
});

/* - Testando checkRateLimit: falhas - */

test.each([
  ["reading the headers", () => mockHeaders],
  ["adding the attempt", () => mockUpdateMany],
  ["looking for the counter", () => mockFindUnique],
  ["deleting the expired counters", () => mockDeleteMany],
])("should block the attempt when it fails while %s", async (_description, getMock) => {
  vi.spyOn(Math, "random").mockReturnValue(0.005);
  getMock().mockRejectedValue(new Error("error"));

  const result = await checkRateLimit(buildInput());

  expect(result).toEqual({ allowed: false });
});

test("should allow the attempt when it fails and allowOnError is true", async () => {
  mockUpdateMany.mockRejectedValue(new Error("db error"));

  const result = await checkRateLimit(buildInput({ allowOnError: true }));

  expect(result).toEqual({ allowed: true });
});

/* - Testando resetRateLimit - */

test("should delete the counter of the action, the ip and the identifier", async () => {
  await resetRateLimit(action, identifier);

  expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { key: buildKey(defaultIp, identifier) } });
});

test("should delete the counter with unknown as the ip and without reading the headers when includeIp is false", async () => {
  await resetRateLimit(action, identifier, false);

  expect(mockHeaders).not.toHaveBeenCalled();
  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { key: buildKey("unknown", identifier) } });
});

test("should delete the counter with an empty hash when there is no identifier", async () => {
  await resetRateLimit(action);

  expect(mockDeleteMany).toHaveBeenCalledWith({ where: { key: buildKey(defaultIp) } });
});

test("should delete the same counter that checkRateLimit created for the same arguments", async () => {
  await checkRateLimit(buildInput({ includeIp: false }));
  await resetRateLimit(action, identifier, false);

  const [{ where: checkedWhere }] = mockFindUnique.mock.calls[0];
  const [{ where: deletedWhere }] = mockDeleteMany.mock.calls[0];

  expect(deletedWhere).toEqual(checkedWhere);
});

test("should resolve without throwing when deleting the counter fails", async () => {
  mockDeleteMany.mockRejectedValue(new Error("db error"));

  await expect(resetRateLimit(action, identifier)).resolves.toBeUndefined();
});

test("should resolve without throwing and skip the database when reading the headers fails", async () => {
  mockHeaders.mockRejectedValue(new Error("headers error"));

  await expect(resetRateLimit(action, identifier)).resolves.toBeUndefined();
  expect(mockDeleteMany).not.toHaveBeenCalled();
});
