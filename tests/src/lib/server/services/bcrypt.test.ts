import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import { compare, hash } from "@/lib/server/services/bcrypt";

/* - Mocks das dependências externas (bcrypt) - */

vi.mock("bcrypt", () => ({ compare: vi.fn(), hash: vi.fn() }));

const mockBcryptCompare = bcryptCompare as unknown as Mock;
const mockBcryptHash = bcryptHash as unknown as Mock;

/* - Funções e dados auxiliares - */

const typedPassword = "senha-digitada";
const hashedPassword = "$2b$10$hash-guardado-no-banco";

beforeEach(() => {
  mockBcryptCompare.mockResolvedValue(true);
  mockBcryptHash.mockResolvedValue(hashedPassword);
});

/* - Testando compare - */

test("should compare the typed password with the hashed password using bcrypt", async () => {
  await compare(typedPassword, hashedPassword);

  expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
  expect(mockBcryptCompare).toHaveBeenCalledWith(typedPassword, hashedPassword);
});

test.each([
  ["true when the passwords match", true],
  ["false when the passwords do not match", false],
])("should return %s", async (_description, bcryptResult) => {
  mockBcryptCompare.mockResolvedValue(bcryptResult);

  const result = await compare(typedPassword, hashedPassword);

  expect(result).toBe(bcryptResult);
});

test("should reject when bcrypt fails to compare", async () => {
  mockBcryptCompare.mockRejectedValue(new Error("bcrypt error"));

  await expect(compare(typedPassword, hashedPassword)).rejects.toThrow("bcrypt error");
});

/* - Testando hash - */

test("should hash the typed password with the salt rounds using bcrypt", async () => {
  await hash(typedPassword, 10);

  expect(mockBcryptHash).toHaveBeenCalledTimes(1);
  expect(mockBcryptHash).toHaveBeenCalledWith(typedPassword, 10);
});

test("should return the hash created by bcrypt", async () => {
  const result = await hash(typedPassword, 10);

  expect(result).toBe(hashedPassword);
});

test("should reject when bcrypt fails to hash", async () => {
  mockBcryptHash.mockRejectedValue(new Error("bcrypt error"));

  await expect(hash(typedPassword, 10)).rejects.toThrow("bcrypt error");
});
