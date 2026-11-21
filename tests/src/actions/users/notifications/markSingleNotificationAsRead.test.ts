import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { markSingleNotificationAsRead } from "@/actions/users/notifications/markSingleNotificationAsRead";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockUpdateManyNotifications = prisma.notification.updateMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const notificationId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockUpdateManyNotifications.mockResolvedValue({ count: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a sessão e a validação - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await markSingleNotificationAsRead(notificationId);

  expect(result).toBe(false);
  expect(mockUpdateManyNotifications).not.toHaveBeenCalled();
});

test.each([
  ["is not a uuid", "not-a-uuid"],
  ["is empty", ""],
])("should return false and skip the database when the notification id %s", async (_description, invalidId) => {
  const result = await markSingleNotificationAsRead(invalidId);

  expect(result).toBe(false);
  expect(mockUpdateManyNotifications).not.toHaveBeenCalled();
});

/* - Testando a atualização no banco - */

test("should mark only the unread notification of the user as read at the current time", async () => {
  await markSingleNotificationAsRead(notificationId);

  expect(mockUpdateManyNotifications).toHaveBeenCalledTimes(1);
  expect(mockUpdateManyNotifications).toHaveBeenCalledWith({
    where: { id: notificationId, userId: "user 1", readAt: null },
    data: { readAt: now },
  });
});

/* - Testando o resultado - */

test("should return true when the notification is marked as read", async () => {
  const result = await markSingleNotificationAsRead(notificationId);

  expect(result).toBe(true);
});

test("should return true when no notification matches, like one that is already read or belongs to another user", async () => {
  mockUpdateManyNotifications.mockResolvedValue({ count: 0 });

  const result = await markSingleNotificationAsRead(notificationId);

  expect(result).toBe(true);
});

/* - Testando as falhas - */

test("should return false when marking the notification as read fails", async () => {
  mockUpdateManyNotifications.mockRejectedValue(new Error("service error"));

  const result = await markSingleNotificationAsRead(notificationId);

  expect(result).toBe(false);
});
