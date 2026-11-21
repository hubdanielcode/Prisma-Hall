import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/actions/admin/checkIsAdmin", () => ({ checkIsAdmin: vi.fn() }));

vi.mock("@vercel/blob", () => ({ put: vi.fn(), del: vi.fn() }));

// O mockDeep cria qualquer model/método (prisma.product.create, prisma.user.count...) sem precisar declarar um por um

vi.mock("@/lib/server/services/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");

  return { prisma: mockDeep() };
});
