import { beforeEach, expect, test, type Mock } from "vitest";
import { getAllAttractions } from "@/actions/events/agenda/getAllAttractions";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

const mockFindMany = prisma.attraction.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildDatabaseAttraction = (overrides: Record<string, unknown> = {}) => ({
  id: "attraction 1",
  name: "Banda Prisma",
  description: "Banda de rock nacional",
  image: "https://blob.vercel-storage.com/1700000000000-banda.png",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
  ...overrides,
});

const expectedAttraction = {
  id: "attraction 1",
  name: "Banda Prisma",
  description: "Banda de rock nacional",
  image: "https://blob.vercel-storage.com/1700000000000-banda.png",
  createdAt: "2026-01-10T12:00:00.000Z",
  updatedAt: "2026-01-11T12:00:00.000Z",
};

beforeEach(() => {
  mockFindMany.mockResolvedValue([]);
});

/* - Testando a consulta ao banco - */

test("should look for all the attractions without any filter", async () => {
  await getAllAttractions();

  expect(mockFindMany).toHaveBeenCalledTimes(1);
  expect(mockFindMany).toHaveBeenCalledWith();
});

/* - Testando o resultado - */

test("should return an empty list when there are no attractions", async () => {
  const result = await getAllAttractions();

  expect(result).toEqual([]);
});

test("should return the attraction with the dates as strings", async () => {
  mockFindMany.mockResolvedValue([buildDatabaseAttraction()]);

  const result = await getAllAttractions();

  expect(result).toEqual([expectedAttraction]);
});

test("should return every attraction in the same order as the database", async () => {
  mockFindMany.mockResolvedValue([
    buildDatabaseAttraction({ id: "attraction 1", name: "Banda Prisma" }),
    buildDatabaseAttraction({ id: "attraction 2", name: "DJ Hall" }),
    buildDatabaseAttraction({ id: "attraction 3", name: "Trio Jazz" }),
  ]);

  const result = await getAllAttractions();

  expect(result).toEqual([
    { ...expectedAttraction, id: "attraction 1", name: "Banda Prisma" },
    { ...expectedAttraction, id: "attraction 2", name: "DJ Hall" },
    { ...expectedAttraction, id: "attraction 3", name: "Trio Jazz" },
  ]);
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the attractions fails", async () => {
  mockFindMany.mockRejectedValue(new Error("db error"));

  await expect(getAllAttractions()).rejects.toThrow("Erro ao buscar atrações.");
});
