import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { deleteUser } from "@/actions/admin/users-management/deleteUser";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { makeAnonymous } from "@/lib/server/users/makeAnonymous";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (checkIsAdmin vem do vitest.setup) - */

vi.mock("@/lib/server/users/makeAnonymous", () => ({ makeAnonymous: vi.fn() }));
vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockMakeAnonymous = makeAnonymous as unknown as Mock;
const mockValidateSession = validateSession as unknown as Mock;

/* - Funções e dados auxiliares - */

const userId = "550e8400-e29b-41d4-a716-446655440000";
const adminId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

const buildSession = (id: string) => ({ session: { id: "session 1" }, user: { id, name: "Admin", email: "admin@email.com", role: "admin" } });

beforeEach(() => {
  mockCheckIsAdmin.mockResolvedValue(true);
  mockValidateSession.mockResolvedValue(buildSession(adminId));
  mockMakeAnonymous.mockResolvedValue(true);
});

/* - Testando permissão e validação - */

test("should return false and skip the session and the anonymization when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await deleteUser(userId);

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the session and the anonymization when the input has %s", async (_description, invalidId) => {
  const result = await deleteUser(invalidId);

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

test("should return false and skip the anonymization when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await deleteUser(userId);

  expect(result).toBe(false);
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

/* - Testando a proteção contra a autoexclusão - */

test("should return false and skip the anonymization when the admin tries to delete their own account", async () => {
  mockValidateSession.mockResolvedValue(buildSession(userId));

  const result = await deleteUser(userId);

  expect(result).toBe(false);
  expect(mockMakeAnonymous).not.toHaveBeenCalled();
});

/* - Testando a anonimização - */

test("should anonymize the user by id", async () => {
  await deleteUser(userId);

  expect(mockMakeAnonymous).toHaveBeenCalledTimes(1);
  expect(mockMakeAnonymous).toHaveBeenCalledWith(userId);
});

test.each([[true], [false], ["last_admin"], ["active_orders"]])("should return exactly what makeAnonymous returns (%s)", async (anonymizeResult) => {
  mockMakeAnonymous.mockResolvedValue(anonymizeResult);

  const result = await deleteUser(userId);

  expect(result).toBe(anonymizeResult);
});

test("should return false when the anonymization throws", async () => {
  mockMakeAnonymous.mockRejectedValue(new Error("db error"));

  const result = await deleteUser(userId);

  expect(result).toBe(false);
});
