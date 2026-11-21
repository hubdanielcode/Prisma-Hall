import { beforeEach, expect, test, type Mock } from "vitest";
import { getAllProductsUsers } from "@/actions/bar/getAllProductsUsers";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

const mockFindMany = prisma.product.findMany as unknown as Mock;

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
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a consulta ao banco - */

test("should look only for the active products", async () => {
  await getAllProductsUsers();

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith({ where: { status: "active" } });
});

/* - Testando o resultado - */

test("should return an empty list when there are no active products", async () => {
  const result = await getAllProductsUsers();

  expect(result).toEqual([]);
});

test("should return the product with the price as a number and the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseProduct()]);

  const result = await getAllProductsUsers();

  expect(result).toEqual([expectedProduct]);
});

test.each([
  ["a free product", 0],
  ["a product with cents", 19.9],
])("should convert the price to a number when the product is %s", async (_description, price) => {
  mockFindMany.mockResolvedValue([buildDatabaseProduct({ price: { toNumber: () => price } })]);

  const result = await getAllProductsUsers();

  expect(result).toEqual([{ ...expectedProduct, price }]);
});

test("should return every product in the same order as the database", async () => {
  mockFindMany.mockResolvedValue([
    buildDatabaseProduct({ id: "product 1", name: "Heineken" }),
    buildDatabaseProduct({ id: "product 2", name: "Corona" }),
    buildDatabaseProduct({ id: "product 3", name: "Água" }),
  ]);

  const result = await getAllProductsUsers();

  expect(result).toEqual([
    { ...expectedProduct, id: "product 1", name: "Heineken" },
    { ...expectedProduct, id: "product 2", name: "Corona" },
    { ...expectedProduct, id: "product 3", name: "Água" },
  ]);
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the products fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getAllProductsUsers()).rejects.toThrow("Erro ao buscar produtos.");
});
