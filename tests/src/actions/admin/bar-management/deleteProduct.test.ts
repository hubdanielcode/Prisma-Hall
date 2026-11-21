import { beforeEach, expect, test, type Mock } from "vitest";
import { deleteProduct } from "@/actions/admin/bar-management/deleteProduct";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/server/services/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

/* - Mocks das dependências externas (checkIsAdmin, @vercel/blob e prisma vêm do vitest.setup) - */

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockDel = del as unknown as Mock;
const mockFindUnique = prisma.product.findUnique as unknown as Mock;
const mockDelete = prisma.product.delete as unknown as Mock;

/* - Funções e dados auxiliares - */

const productId = "550e8400-e29b-41d4-a716-446655440000";
const imageUrl = "https://blob.vercel-storage.com/1700000000000-heineken.png";

const buildPrismaError = (code: string, meta: Record<string, unknown>) =>
  new PrismaClientKnownRequestError("prisma error", { code, clientVersion: "test", meta });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockFindUnique.mockResolvedValue({ image: imageUrl });
  mockDelete.mockResolvedValue({});
  mockDel.mockResolvedValue(undefined);
});

/* - Testando permissão e validação - */

test("should return false and skip the database and the blob when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await deleteProduct(productId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the database and the blob when the input has %s", async (_description, invalidId) => {
  const result = await deleteProduct(invalidId);

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should look for the image of the product to delete", async () => {
  await deleteProduct(productId);

  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: productId }, select: { image: true } });
});

test("should return false and skip the delete and the blob when the product does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await deleteProduct(productId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});

test("should delete the product by id", async () => {
  await deleteProduct(productId);

  expect(mockDelete).toHaveBeenCalledWith({ where: { id: productId } });
});

/* - Testando o resultado - */

test("should return true and remove the image from the blob only after the product is deleted", async () => {
  const result = await deleteProduct(productId);

  expect(result).toBe(true);
  expect(mockDel).toHaveBeenCalledWith(imageUrl);
  expect(mockDelete.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should still return true when removing the image from the blob fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await deleteProduct(productId);

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return product_in_use and keep the image when the product is used by other records", async () => {
  mockDelete.mockRejectedValue(buildPrismaError("P2003", { constraint: "Voucher_product_fkey" }));

  const result = await deleteProduct(productId);

  expect(result).toBe("product_in_use");
  expect(mockDel).not.toHaveBeenCalled();
});

test.each([
  ["a foreign key error from another field", buildPrismaError("P2003", { constraint: "Voucher_order_fkey" })],
  ["a prisma error that is not a foreign key", buildPrismaError("P2025", { constraint: "Voucher_product_fkey" })],
  ["an unknown error", new Error("db error")],
])("should return false and keep the image when deleting the product fails with %s", async (_description, error) => {
  mockDelete.mockRejectedValue(error);

  const result = await deleteProduct(productId);

  expect(result).toBe(false);
  expect(mockDel).not.toHaveBeenCalled();
});

test("should return false and skip the delete when looking for the product fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  const result = await deleteProduct(productId);

  expect(result).toBe(false);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});
