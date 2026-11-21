import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { getUserIdsThatFavoritedEvent, notifyFavoriteEventByEmail, notifyPromotionsByEmail, notifyUsersByEmail } from "@/lib/server";
import { getResend } from "@/lib/server/services/resend";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

vi.mock("@/lib/server/services/resend", () => ({ getResend: vi.fn() }));

const mockGetResend = getResend as unknown as Mock;
const mockCreateMany = prisma.notification.createMany as unknown as Mock;
const mockFindManyUsers = prisma.user.findMany as unknown as Mock;
const mockFindManyPreferences = prisma.notificationPreference.findMany as unknown as Mock;
const mockFindManyFavorites = prisma.favoriteEvent.findMany as unknown as Mock;
const mockSend = vi.fn();

/* - Funções e dados auxiliares - */

type NotificationPayload = Parameters<typeof notifyUsersByEmail>[1];

const eventId = "3b1f7c2a-9d4e-4f6a-8c1b-5e2d7a9f0c34";
const userIds = ["user 1", "user 2"];

const buildPayload = (overrides: Partial<NotificationPayload> = {}): NotificationPayload => ({
  type: "promotion" as never,
  title: "Novo evento",
  message: "Um novo evento foi publicado.",
  ...overrides,
});

const buildExpectedNotifications = (payload: NotificationPayload) =>
  userIds.map((userId) => ({ userId, type: payload.type, title: payload.title, message: payload.message }));

beforeEach(() => {
  mockCreateMany.mockResolvedValue({ count: 2 });
  mockFindManyUsers.mockResolvedValue([{ email: "ana@example.com" }, { email: "bruno@example.com" }]);
  mockFindManyPreferences.mockResolvedValue([{ userId: "user 1" }, { userId: "user 2" }]);
  mockFindManyFavorites.mockResolvedValue([{ userId: "user 1" }, { userId: "user 2" }]);
  mockGetResend.mockReturnValue({ emails: { send: mockSend } });
  mockSend.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando notifyUsersByEmail: lista de usuários vazia - */

test("should return false and skip the database and the email when there are no users", async () => {
  const result = await notifyUsersByEmail([], buildPayload());

  expect(result).toBe(false);
  expect(mockCreateMany).not.toHaveBeenCalled();
  expect(mockFindManyUsers).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando notifyUsersByEmail: consulta ao banco - */

test("should create one notification in the app for each user", async () => {
  const payload = buildPayload();

  await notifyUsersByEmail(userIds, payload);

  expect(mockCreateMany).toHaveBeenCalledTimes(1);
  expect(mockCreateMany).toHaveBeenCalledWith({ data: buildExpectedNotifications(payload) });
});

test("should look for the email recipients only among the users that enabled the email notifications", async () => {
  await notifyUsersByEmail(userIds, buildPayload());

  expect(mockFindManyUsers).toHaveBeenCalledTimes(1);
  expect(mockFindManyUsers).toHaveBeenCalledWith({
    where: { id: { in: userIds }, notificationPreferences: { is: { notifyByEmail: true } } },
    select: { email: true },
  });
});

/* - Testando notifyUsersByEmail: envio dos emails - */

test("should send one email for each recipient", async () => {
  const payload = buildPayload();

  await notifyUsersByEmail(userIds, payload);

  expect(mockSend).toHaveBeenCalledTimes(2);
  expect(mockSend).toHaveBeenCalledWith({
    from: "Prisma Hall <naoresponda@prismahall.com>",
    to: "ana@example.com",
    subject: payload.title,
    text: payload.message,
  });
  expect(mockSend).toHaveBeenCalledWith({
    from: "Prisma Hall <naoresponda@prismahall.com>",
    to: "bruno@example.com",
    subject: payload.title,
    text: payload.message,
  });
});

test("should skip the email provider when no user enabled the email notifications", async () => {
  mockFindManyUsers.mockResolvedValue([]);

  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(true);
  expect(mockGetResend).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

/* - Testando notifyUsersByEmail: resultado - */

test("should return true when the notifications are created and the emails are sent", async () => {
  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(true);
});

test("should return true and still try every recipient when an email fails", async () => {
  mockSend.mockRejectedValueOnce(new Error("resend error"));

  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(true);
  expect(mockSend).toHaveBeenCalledTimes(2);
});

/* - Testando notifyUsersByEmail: falhas - */

test("should return false and skip the emails when creating the notifications fails", async () => {
  mockCreateMany.mockRejectedValue(new Error("db error"));

  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(false);
  expect(mockFindManyUsers).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test("should return false when looking for the email recipients fails", async () => {
  mockFindManyUsers.mockRejectedValue(new Error("db error"));

  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(false);
  expect(mockSend).not.toHaveBeenCalled();
});

test("should return false when the email provider cannot be created", async () => {
  mockGetResend.mockImplementation(() => {
    throw new Error("missing api key");
  });

  const result = await notifyUsersByEmail(userIds, buildPayload());

  expect(result).toBe(false);
});

/* - Testando notifyPromotionsByEmail: consulta ao banco - */

test("should look for the users that enabled the promotion notifications", async () => {
  await notifyPromotionsByEmail(buildPayload());

  expect(mockFindManyPreferences).toHaveBeenCalledTimes(1);
  expect(mockFindManyPreferences).toHaveBeenCalledWith({
    where: { notifyPromotions: true, userId: { notIn: [] } },
    select: { userId: true },
  });
});

test("should leave out the excluded users from the promotion query", async () => {
  await notifyPromotionsByEmail(buildPayload(), ["user 2"]);

  expect(mockFindManyPreferences).toHaveBeenCalledWith({
    where: { notifyPromotions: true, userId: { notIn: ["user 2"] } },
    select: { userId: true },
  });
});

/* - Testando notifyPromotionsByEmail: resultado - */

test("should notify every promotion subscriber with the payload", async () => {
  const payload = buildPayload();

  const result = await notifyPromotionsByEmail(payload);

  expect(result).toBe(true);
  expect(mockCreateMany).toHaveBeenCalledWith({ data: buildExpectedNotifications(payload) });
  expect(mockSend).toHaveBeenCalledTimes(2);
});

test("should return false and skip the notifications when there are no promotion subscribers", async () => {
  mockFindManyPreferences.mockResolvedValue([]);

  const result = await notifyPromotionsByEmail(buildPayload());

  expect(result).toBe(false);
  expect(mockCreateMany).not.toHaveBeenCalled();
});

/* - Testando notifyPromotionsByEmail: falhas do banco - */

test("should return false when looking for the promotion subscribers fails", async () => {
  mockFindManyPreferences.mockRejectedValue(new Error("db error"));

  const result = await notifyPromotionsByEmail(buildPayload());

  expect(result).toBe(false);
  expect(mockCreateMany).not.toHaveBeenCalled();
});

test("should return false when creating the promotion notifications fails", async () => {
  mockCreateMany.mockRejectedValue(new Error("db error"));

  const result = await notifyPromotionsByEmail(buildPayload());

  expect(result).toBe(false);
});

/* - Testando getUserIdsThatFavoritedEvent - */

test("should look for the favorites of the event from users that enabled the favorite event notifications", async () => {
  await getUserIdsThatFavoritedEvent(eventId);

  expect(mockFindManyFavorites).toHaveBeenCalledTimes(1);
  expect(mockFindManyFavorites).toHaveBeenCalledWith({
    where: { eventId, user: { notificationPreferences: { is: { notifyFavoriteEvents: true } } } },
    select: { userId: true },
  });
});

test("should return only the user ids that favorited the event", async () => {
  const result = await getUserIdsThatFavoritedEvent(eventId);

  expect(result).toEqual(["user 1", "user 2"]);
});

test("should return an empty list when nobody favorited the event", async () => {
  mockFindManyFavorites.mockResolvedValue([]);

  const result = await getUserIdsThatFavoritedEvent(eventId);

  expect(result).toEqual([]);
});

test("should return an empty list when looking for the favorites fails", async () => {
  mockFindManyFavorites.mockRejectedValue(new Error("db error"));

  const result = await getUserIdsThatFavoritedEvent(eventId);

  expect(result).toEqual([]);
});

/* - Testando notifyFavoriteEventByEmail - */

test("should look for the users that favorited the event before notifying", async () => {
  await notifyFavoriteEventByEmail(eventId, buildPayload());

  expect(mockFindManyFavorites).toHaveBeenCalledTimes(1);
  expect(mockFindManyFavorites).toHaveBeenCalledWith({
    where: { eventId, user: { notificationPreferences: { is: { notifyFavoriteEvents: true } } } },
    select: { userId: true },
  });
});

test("should notify the users that favorited the event with the payload", async () => {
  const payload = buildPayload();

  const result = await notifyFavoriteEventByEmail(eventId, payload);

  expect(result).toBe(true);
  expect(mockCreateMany).toHaveBeenCalledWith({ data: buildExpectedNotifications(payload) });
  expect(mockSend).toHaveBeenCalledTimes(2);
});

test("should return false and skip the notifications when nobody favorited the event", async () => {
  mockFindManyFavorites.mockResolvedValue([]);

  const result = await notifyFavoriteEventByEmail(eventId, buildPayload());

  expect(result).toBe(false);
  expect(mockCreateMany).not.toHaveBeenCalled();
});

test("should return false and skip the notifications when looking for the favorites fails", async () => {
  mockFindManyFavorites.mockRejectedValue(new Error("db error"));

  const result = await notifyFavoriteEventByEmail(eventId, buildPayload());

  expect(result).toBe(false);
  expect(mockCreateMany).not.toHaveBeenCalled();
});

test("should return false when creating the favorite event notifications fails", async () => {
  mockCreateMany.mockRejectedValue(new Error("db error"));

  const result = await notifyFavoriteEventByEmail(eventId, buildPayload());

  expect(result).toBe(false);
});
