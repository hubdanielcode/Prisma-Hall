import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { updateNotificationPreferences } from "@/actions/users/notifications/updateNotificationPreferences";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockUpsertPreferences = prisma.notificationPreference.upsert as unknown as Mock;

/* - Funções e dados auxiliares - */

type UpdateNotificationPreferencesInput = Parameters<typeof updateNotificationPreferences>[0];

const createdAt = new Date("2026-01-15T18:00:00.000Z");
const updatedAt = new Date("2026-01-16T09:30:00.000Z");

const buildInput = (overrides: Record<string, unknown> = {}) =>
  ({ notifyFavoriteEvents: true, notifyPromotions: false, notifyByEmail: true, ...overrides }) as unknown as UpdateNotificationPreferencesInput;

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabasePreferences = (overrides: Record<string, unknown> = {}) => ({
  id: "preferences 1",
  userId: "user 1",
  notifyFavoriteEvents: true,
  notifyPromotions: false,
  notifyByEmail: true,
  createdAt,
  updatedAt,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockUpsertPreferences.mockResolvedValue(buildDatabasePreferences());
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await updateNotificationPreferences(buildInput());

  expect(result).toBe(false);
  expect(mockUpsertPreferences).not.toHaveBeenCalled();
});

test.each([
  ["a preference that is not a boolean", { notifyPromotions: "yes" }],
  ["a null preference", { notifyByEmail: null }],
  ["no preference at all", { notifyFavoriteEvents: undefined, notifyPromotions: undefined, notifyByEmail: undefined }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await updateNotificationPreferences(buildInput(invalidInput));

  expect(result).toBe(false);
  expect(mockUpsertPreferences).not.toHaveBeenCalled();
});

/* - Testando a gravação no banco - */

test("should save the preferences of the user, creating them when they do not exist", async () => {
  await updateNotificationPreferences(buildInput());

  const preferences = { notifyFavoriteEvents: true, notifyPromotions: false, notifyByEmail: true };

  expect(mockUpsertPreferences).toHaveBeenCalledTimes(1);
  expect(mockUpsertPreferences).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    update: preferences,
    create: { userId: "user 1", ...preferences },
  });
});

test("should save the preferences of the logged user and not of an id that came in the input", async () => {
  await updateNotificationPreferences(buildInput({ userId: "user 2" }));

  const upsertParams = mockUpsertPreferences.mock.calls[0][0];

  expect(upsertParams.where).toEqual({ userId: "user 1" });
  expect(upsertParams.create.userId).toBe("user 1");
});

/* - Testando o resultado - */

test("should return the saved preferences with the dates as ISO strings", async () => {
  const result = await updateNotificationPreferences(buildInput());

  expect(result).toEqual({
    notifyFavoriteEvents: true,
    notifyPromotions: false,
    notifyByEmail: true,
    createdAt: "2026-01-15T18:00:00.000Z",
    updatedAt: "2026-01-16T09:30:00.000Z",
  });
});

test("should not expose the ids of the preferences", async () => {
  const result = await updateNotificationPreferences(buildInput());

  expect(result).toEqual(expect.not.objectContaining({ id: expect.anything(), userId: expect.anything() }));
});

/* - Testando as falhas - */

test("should return false when saving the preferences fails", async () => {
  mockUpsertPreferences.mockRejectedValue(new Error("service error"));

  const result = await updateNotificationPreferences(buildInput());

  expect(result).toBe(false);
});
