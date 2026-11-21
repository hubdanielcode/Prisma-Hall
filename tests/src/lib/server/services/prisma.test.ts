import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

/* - Mocks das dependências externas (o tests/setup.ts mocka este módulo, então o real é carregado com importActual) - */

// Criados com vi.hoisted para continuarem os mesmos depois do vi.resetModules

const { mockPrismaClient, mockPrismaPg } = vi.hoisted(() => ({
  mockPrismaClient: vi.fn(function () {}),
  mockPrismaPg: vi.fn(function () {}),
}));

vi.mock("@/prisma/generated/prisma/client", () => ({ PrismaClient: mockPrismaClient }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: mockPrismaPg }));

/* - Funções e dados auxiliares - */

const databaseUrl = "postgresql://user:password@localhost:5432/prismahall";

const loadPrismaService = async () => {
  vi.resetModules();

  return vi.importActual<typeof import("@/lib/server/services/prisma")>("@/lib/server/services/prisma");
};

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", databaseUrl);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/* - Testando a criação do cliente - */

test("should create the postgres adapter with the connection string from the environment", async () => {
  await loadPrismaService();

  expect(mockPrismaPg).toHaveBeenCalledTimes(1);
  expect(mockPrismaPg).toHaveBeenCalledWith({ connectionString: databaseUrl });
});

test("should create the prisma client with the postgres adapter", async () => {
  await loadPrismaService();

  expect(mockPrismaClient).toHaveBeenCalledTimes(1);
  expect(mockPrismaClient).toHaveBeenCalledWith({ adapter: (mockPrismaPg as Mock).mock.instances[0] });
});

/* - Testando o resultado - */

test("should export the client that was created", async () => {
  const { prisma } = await loadPrismaService();

  expect(prisma).toBe((mockPrismaClient as Mock).mock.instances[0]);
});
