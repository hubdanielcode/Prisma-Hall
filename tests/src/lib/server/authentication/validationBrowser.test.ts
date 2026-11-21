import { createHash } from "node:crypto";
import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { cookies } from "next/headers";
import {
  clearValidationBrowserCookie,
  doesValidationBrowserMatch,
  readValidationBrowserHash,
  renewValidationBrowser,
  startValidationBrowser,
} from "@/lib/server";

/* - Mocks das dependências externas (next/headers) - */

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockCookies = cookies as unknown as Mock;

/* - Funções e dados auxiliares - */

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };

const validationBrowserKey = "chave-secreta-do-cadastro";

const secureCookieOptions = { httpOnly: true, secure: true, maxAge: 900, sameSite: "lax", path: "/" };

const hashOf = (key: string) => createHash("sha256").update(key).digest("hex");

const storedHash = hashOf(validationBrowserKey);

beforeEach(() => {
  mockCookies.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: validationBrowserKey });
});

/* - Testando startValidationBrowser: cookie entregue ao navegador - */

test("should set the cookie with a random 64-character hex key and the secure options", async () => {
  await startValidationBrowser();

  expect(cookieStore.set).toHaveBeenCalledTimes(1);

  const [cookieName, cookieValue, cookieOptions] = cookieStore.set.mock.calls[0];

  expect(cookieName).toBe("pendingValidation");
  expect(cookieValue).toMatch(/^[0-9a-f]{64}$/);
  expect(cookieOptions).toEqual(secureCookieOptions);
});

test("should generate a different key on each call", async () => {
  await startValidationBrowser();
  await startValidationBrowser();

  expect(cookieStore.set.mock.calls[0][1]).not.toBe(cookieStore.set.mock.calls[1][1]);
});

test("should return the hash of the key delivered in the cookie, never the key itself", async () => {
  const result = await startValidationBrowser();

  const cookieValue = cookieStore.set.mock.calls[0][1];

  expect(result).toBe(hashOf(cookieValue));
  expect(result).not.toBe(cookieValue);
});

/* - Testando renewValidationBrowser: navegador sem a chave do cadastro - */

test.each([
  ["no cookie", undefined],
  ["an empty cookie value", { value: "" }],
])("should return null and skip setting the cookie on renew when the browser has %s", async (_description, cookie) => {
  cookieStore.get.mockReturnValue(cookie);

  const result = await renewValidationBrowser();

  expect(result).toBeNull();
  expect(cookieStore.set).not.toHaveBeenCalled();
});

/* - Testando renewValidationBrowser: navegador com a chave do cadastro - */

test("should read the cookie of the pending validation on renew", async () => {
  await renewValidationBrowser();

  expect(cookieStore.get).toHaveBeenCalledTimes(1);
  expect(cookieStore.get).toHaveBeenCalledWith("pendingValidation");
});

test("should renew the cookie with the same key and the secure options", async () => {
  await renewValidationBrowser();

  expect(cookieStore.set).toHaveBeenCalledTimes(1);
  expect(cookieStore.set).toHaveBeenCalledWith("pendingValidation", validationBrowserKey, secureCookieOptions);
});

test("should return the hash of the key that the browser already had on renew", async () => {
  const result = await renewValidationBrowser();

  expect(result).toBe(storedHash);
});

/* - Testando readValidationBrowserHash - */

test.each([
  ["no cookie", undefined],
  ["an empty cookie value", { value: "" }],
])("should return null when reading the hash and the browser has %s", async (_description, cookie) => {
  cookieStore.get.mockReturnValue(cookie);

  const result = await readValidationBrowserHash();

  expect(result).toBeNull();
});

test("should read the cookie of the pending validation when reading the hash", async () => {
  await readValidationBrowserHash();

  expect(cookieStore.get).toHaveBeenCalledTimes(1);
  expect(cookieStore.get).toHaveBeenCalledWith("pendingValidation");
});

test("should return the sha256 hex hash of the key from the browser", async () => {
  cookieStore.get.mockReturnValue({ value: "abc" });

  const result = await readValidationBrowserHash();

  // sha256("abc")

  expect(result).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("should not change the cookie when reading the hash", async () => {
  await readValidationBrowserHash();

  expect(cookieStore.set).not.toHaveBeenCalled();
  expect(cookieStore.delete).not.toHaveBeenCalled();
});

/* - Testando doesValidationBrowserMatch: hashes iguais e ausentes - */

test("should return true when both hashes are the same", () => {
  const result = doesValidationBrowserMatch({ storedValidationBrowserHash: storedHash, browserValidationBrowserHash: hashOf(validationBrowserKey) });

  expect(result).toBe(true);
});

test.each([
  ["no stored hash", { storedValidationBrowserHash: null, browserValidationBrowserHash: storedHash }],
  ["no browser hash", { storedValidationBrowserHash: storedHash, browserValidationBrowserHash: null }],
  ["neither of the hashes", { storedValidationBrowserHash: null, browserValidationBrowserHash: null }],
  ["empty strings", { storedValidationBrowserHash: "", browserValidationBrowserHash: "" }],
])("should return false when there is %s", (_description, hashes) => {
  expect(doesValidationBrowserMatch(hashes)).toBe(false);
});

/* - Testando doesValidationBrowserMatch: hashes diferentes - */

test("should return false when the hashes have the same length but different values", () => {
  const result = doesValidationBrowserMatch({ storedValidationBrowserHash: storedHash, browserValidationBrowserHash: hashOf("outra-chave") });

  expect(result).toBe(false);
});

test("should return false without throwing when the hashes have different lengths", () => {
  const result = doesValidationBrowserMatch({ storedValidationBrowserHash: storedHash, browserValidationBrowserHash: "abc" });

  expect(result).toBe(false);
});

/* - Testando clearValidationBrowserCookie - */

test("should delete the cookie of the pending validation", async () => {
  await clearValidationBrowserCookie();

  expect(cookieStore.delete).toHaveBeenCalledTimes(1);
  expect(cookieStore.delete).toHaveBeenCalledWith("pendingValidation");
});

test("should not set any cookie when clearing", async () => {
  await clearValidationBrowserCookie();

  expect(cookieStore.set).not.toHaveBeenCalled();
});

/* - Testando as falhas do cookie store - */

test.each([
  ["startValidationBrowser", startValidationBrowser],
  ["renewValidationBrowser", renewValidationBrowser],
  ["readValidationBrowserHash", readValidationBrowserHash],
  ["clearValidationBrowserCookie", clearValidationBrowserCookie],
])("should reject when the cookie store is not available in %s", async (_description, fn) => {
  mockCookies.mockRejectedValue(new Error("cookies error"));

  await expect(fn()).rejects.toThrow("cookies error");
});
