import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (o validateSession é mockado aqui, o checkIsAdmin real é importado porque o vitest.setup o mocka globalmente) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const { checkIsAdmin } = await vi.importActual<typeof import("@/actions/admin/checkIsAdmin")>("@/actions/admin/checkIsAdmin");
const mockValidateSession = validateSession as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = (role: string) => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Daniel", email: "daniel@gmail.com", role },
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession("admin"));
});

/* - Testando a sessão - */

test("should validate the session of the current user", async () => {
  await checkIsAdmin();

  expect(mockValidateSession).toHaveBeenCalledTimes(1);
});

test("should return false when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await checkIsAdmin();

  expect(result).toBe(false);
});

/* - Testando o papel do usuário - */

test("should return true when the user is an admin", async () => {
  const result = await checkIsAdmin();

  expect(result).toBe(true);
});

test.each([
  ["a regular user", "user"],
  ["an unknown role", "invalid"],
  ["an empty role", ""],
  ["a role with different casing", "Admin"],
])("should return false when the session belongs to %s", async (_description, role) => {
  mockValidateSession.mockResolvedValue(buildValidSession(role));

  const result = await checkIsAdmin();

  expect(result).toBe(false);
});

/* - Testando as falhas da sessão - */

test("should let the error through when validating the session throws", async () => {
  mockValidateSession.mockRejectedValue(new Error("session error"));

  await expect(checkIsAdmin()).rejects.toThrow("session error");
});
