import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getMyNotifications } from "@/actions/users/notifications/getMyNotifications";
import { prisma } from "@/lib/server/services/prisma";
import { validateSession } from "@/actions/authentication/validateSession";

/* - Mocks das dependências externas (prisma vem do vitest.setup) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));

const mockValidateSession = validateSession as unknown as Mock;
const mockFindManyNotifications = prisma.notification.findMany as unknown as Mock;

/* - Funções e dados auxiliares - */

const createdAt = new Date("2026-01-15T18:00:00.000Z");
const updatedAt = new Date("2026-01-16T09:30:00.000Z");
const readAt = new Date("2026-01-17T12:00:00.000Z");

const buildValidSession = () => ({
  session: { id: "session 1", userId: "user 1" },
  user: { id: "user 1", name: "Maria Silva", email: "maria@gmail.com", role: "user" },
});

const buildDatabaseNotification = (overrides: Record<string, unknown> = {}) => ({
  id: "notification 1",
  userId: "user 1",
  type: "promotion",
  title: "Nova promoção",
  message: "Ingressos com desconto neste fim de semana",
  readAt: null,
  createdAt,
  updatedAt,
  ...overrides,
});

beforeEach(() => {
  mockValidateSession.mockResolvedValue(buildValidSession());
  mockFindManyNotifications.mockResolvedValue([buildDatabaseNotification()]);
});

/* - Testando a sessão - */

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await getMyNotifications();

  expect(result).toBe(false);
  expect(mockFindManyNotifications).not.toHaveBeenCalled();
});

/* - Testando a consulta ao banco - */

test("should look for the 30 most recent notifications of the user", async () => {
  await getMyNotifications();

  expect(mockFindManyNotifications).toHaveBeenCalledTimes(1);
  expect(mockFindManyNotifications).toHaveBeenCalledWith({
    where: { userId: "user 1" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
});

/* - Testando o resultado - */

test("should return the notifications with the dates as ISO strings", async () => {
  const result = await getMyNotifications();

  expect(result).toEqual([
    {
      id: "notification 1",
      type: "promotion",
      title: "Nova promoção",
      message: "Ingressos com desconto neste fim de semana",
      readAt: null,
      createdAt: "2026-01-15T18:00:00.000Z",
      updatedAt: "2026-01-16T09:30:00.000Z",
    },
  ]);
});

test("should return the read date as an ISO string when the notification was read", async () => {
  mockFindManyNotifications.mockResolvedValue([buildDatabaseNotification({ readAt })]);

  const result = await getMyNotifications();

  expect(result).toEqual([expect.objectContaining({ readAt: "2026-01-17T12:00:00.000Z" })]);
});

test("should keep the order that came from the database", async () => {
  mockFindManyNotifications.mockResolvedValue([
    buildDatabaseNotification({ id: "notification 2" }),
    buildDatabaseNotification({ id: "notification 1" }),
  ]);

  const result = await getMyNotifications();

  expect(result).toEqual([expect.objectContaining({ id: "notification 2" }), expect.objectContaining({ id: "notification 1" })]);
});

test("should not expose the user id of the notification", async () => {
  const result = await getMyNotifications();

  expect(result).toEqual([expect.not.objectContaining({ userId: expect.anything() })]);
});

test("should return an empty list when the user has no notifications", async () => {
  mockFindManyNotifications.mockResolvedValue([]);

  const result = await getMyNotifications();

  expect(result).toEqual([]);
});

/* - Testando as falhas - */

test("should throw an error when looking for the notifications fails", async () => {
  mockFindManyNotifications.mockRejectedValue(new Error("service error"));

  await expect(getMyNotifications()).rejects.toThrow("Erro ao buscar notificações.");
});
