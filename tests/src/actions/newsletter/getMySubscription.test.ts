import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getMySubscription } from "@/actions/newsletter/getMySubscription";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindUnique = prisma.newsletter.findUnique as unknown as Mock;

/* - Funções e dados auxiliares - */

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindUnique.mockResolvedValue({ userId: "user 1", email: "maria@gmail.com", isSubscribed: true });
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getMySubscription();

  expect(result).toBe(false);
  expect(mockFindUnique).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the subscription of the user and the e-mail in the session", async () => {
  await getMySubscription();

  expect(mockFindUnique).toHaveBeenCalledTimes(1);
  expect(mockFindUnique).toHaveBeenCalledWith({ where: { userId_email: { userId: "user 1", email: "maria@gmail.com" } } });
});

/* - Testando o resultado - */

test("should return false when the user has no subscription", async () => {
  mockFindUnique.mockResolvedValue(null);

  const result = await getMySubscription();

  expect(result).toBe(false);
});

test.each([
  ["subscribed", true],
  ["not subscribed anymore", false],
])("should return the subscription status when the user is %s", async (_description, isSubscribed) => {
  mockFindUnique.mockResolvedValue({ userId: "user 1", email: "maria@gmail.com", isSubscribed });

  const result = await getMySubscription();

  expect(result).toBe(isSubscribed);
});

/* - Testando as falhas do banco - */

test("should return false when fetching the subscription fails", async () => {
  mockFindUnique.mockRejectedValue(new Error("db error"));

  const result = await getMySubscription();

  expect(result).toBe(false);
});
