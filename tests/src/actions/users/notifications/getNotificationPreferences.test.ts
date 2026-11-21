import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getNotificationPreferences } from "@/actions/users/notifications/getNotificationPreferences";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockUpsertPreferences = prisma.notificationPreference.upsert as unknown as Mock;

/* - Funções e dados auxiliares - */

const createdAt = new Date("2026-01-15T18:00:00.000Z");
const updatedAt = new Date("2026-01-16T09:30:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabasePreferences = (overrides: Record<string, unknown> = {}) => ({
  id: "preferences 1",
  userId: "user 1",
  notifyFavoriteEvents: false,
  notifyPromotions: false,
  notifyByEmail: false,
  createdAt,
  updatedAt,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockUpsertPreferences.mockResolvedValue(buildDatabasePreferences());
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getNotificationPreferences();

  expect(result).toBe(false);
  expect(mockUpsertPreferences).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should create the preferences with the default values when the user has none, without changing existing ones", async () => {
  await getNotificationPreferences();

  expect(mockUpsertPreferences).toHaveBeenCalledTimes(1);
  expect(mockUpsertPreferences).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    update: {},
    create: { userId: "user 1" },
  });
});

/* - Testando o resultado - */

test("should return the preferences with the dates as ISO strings", async () => {
  const result = await getNotificationPreferences();

  expect(result).toEqual({
    notifyFavoriteEvents: false,
    notifyPromotions: false,
    notifyByEmail: false,
    createdAt: "2026-01-15T18:00:00.000Z",
    updatedAt: "2026-01-16T09:30:00.000Z",
  });
});

test("should return the preferences that the user already saved", async () => {
  mockUpsertPreferences.mockResolvedValue(buildDatabasePreferences({ notifyFavoriteEvents: true, notifyPromotions: false, notifyByEmail: true }));

  const result = await getNotificationPreferences();

  expect(result).toEqual(expect.objectContaining({ notifyFavoriteEvents: true, notifyPromotions: false, notifyByEmail: true }));
});

test("should not expose the ids of the preferences", async () => {
  const result = await getNotificationPreferences();

  expect(result).toEqual(expect.not.objectContaining({ id: expect.anything(), userId: expect.anything() }));
});

/* - Testando as falhas - */

test("should throw an error when looking for the preferences fails", async () => {
  mockUpsertPreferences.mockRejectedValue(new Error("service error"));

  await expect(getNotificationPreferences()).rejects.toThrow("Erro ao buscar preferências de notificação.");
});
