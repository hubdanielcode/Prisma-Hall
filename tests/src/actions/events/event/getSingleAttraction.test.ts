import { beforeEach, expect, test, type Mock } from "vitest";
import { getSingleAttraction } from "@/actions/events/event/getSingleAttraction";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

const mockFindUnique = prisma.attraction.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildDatabaseAttraction = () => ({
  id: "attraction 1",
  name: "Banda Prisma",
  description: "Banda de rock nacional",
  image: "https://blob.vercel-storage.com/1700000000000-banda.png",
  createdAt: new Date("2026-01-10T12:00:00.000Z"),
  updatedAt: new Date("2026-01-11T12:00:00.000Z"),
});

beforeEach(() => {
  mockFindUnique.mockResolvedValue(buildDatabaseAttraction());
});

/* - Testando a consulta ao banco - */

test("should look for the attraction by its id", async () => {
  await getSingleAttraction("attraction 9");

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "attraction 9" } });
});

test("should return false when the attraction does not exist", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await getSingleAttraction("attraction 1");

  expect(result).toBe(false);
});

/* - Testando o resultado - */

test("should return the attraction with the dates as strings", async () => {
  const result = await getSingleAttraction("attraction 1");

  expect(result).toEqual({
    id: "attraction 1",
    name: "Banda Prisma",
    description: "Banda de rock nacional",
    image: "https://blob.vercel-storage.com/1700000000000-banda.png",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-11T12:00:00.000Z",
  });
});

/* - Testando as falhas do banco - */

test("should throw an error when fetching the attraction fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  await expect(getSingleAttraction("attraction 1")).rejects.toThrow("Erro ao buscar atração.");
});
