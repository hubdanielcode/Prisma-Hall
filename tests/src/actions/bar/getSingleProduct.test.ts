import { beforeEach, expect, test, type Mock } from "vitest";
import { getSingleProduct } from "@/actions/bar/getSingleProduct";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

const mockFindUnique = prisma.product.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

// O price do Prisma é um Decimal, por isso o mock tem o método toNumber

const buildDatabaseProduct = (overrides: Record<string, unknown> = {}) => ({
  id: "product 1",
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
  price: { toNumber: () => 12.5 },
  status: "active",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const expectedProduct = {
  id: "product 1",
  name: "Heineken",
  description: "Cerveja long neck 330ml",
  category: "beers",
  quantity: 10,
  image: "https://blob.vercel-storage.com/1700000000000-heineken.png",
  price: 12.5,
  status: "active",
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

beforeEach(() => {
  mockFindUnique.mockResolvedValue(buildDatabaseProduct());
});

/* - Testando a consulta ao banco - */

test("should look for the product by its id only when it is active", async () => {
  await getSingleProduct("product 9");

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "product 9", status: "active" } });
});

/* - Testando o produto não encontrado - */

test("should return false when the product does not exist or is not active", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await getSingleProduct("product 1");

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the product with the price as a number and the dates as strings", async () => {
  const result = await getSingleProduct("product 1");

  expect(result).toEqual(expectedProduct);
});

test.each([
  ["a free product", 0],
  ["a product with cents", 19.9],
])("should convert the price to a number when the product is %s", async (_description, price) => {
  mockFindUnique.mockResolvedValue(buildDatabaseProduct({ price: { toNumber: () => price } }));

  const result = await getSingleProduct("product 1");

  expect(result).toEqual({ ...expectedProduct, price });
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the product fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  await expect(getSingleProduct("product 1")).rejects.toThrow("Erro ao buscar produto.");
});
