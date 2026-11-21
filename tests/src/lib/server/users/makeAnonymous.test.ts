import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { del } from "@vercel/blob";
import { makeAnonymous } from "@/lib/server/users/makeAnonymous";
import { validateSession } from "@/actions/authentication/validateSession";
import { hash } from "@/lib/server/services/bcrypt";
import { expireStripeCheckoutSessions } from "@/lib/server/payments/expireStripeCheckoutSessions";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (del e prisma vêm do tests/setup.ts) - */

vi.mock("@/actions/authentication/validateSession", () => ({ validateSession: vi.fn() }));
vi.mock("@/lib/server/services/bcrypt", () => ({ hash: vi.fn() }));
vi.mock("@/lib/server/payments/expireStripeCheckoutSessions", () => ({ expireStripeCheckoutSessions: vi.fn() }));

const mockDel = del as unknown as Mock;
const mockValidateSession = validateSession as unknown as Mock;
const mockHash = hash as unknown as Mock;
const mockExpireStripeCheckoutSessions = expireStripeCheckoutSessions as unknown as Mock;
const mockTransaction = prisma.$transaction as unknown as Mock;
const mockUserFindUnique = prisma.user.findUnique as unknown as Mock;
const mockUserCount = prisma.user.count as unknown as Mock;
const mockUserUpdate = prisma.user.update as unknown as Mock;
const mockTicketFindFirst = prisma.ticket.findFirst as unknown as Mock;
const mockVoucherFindFirst = prisma.voucher.findFirst as unknown as Mock;
const mockTicketOrderFindMany = prisma.ticketOrder.findMany as unknown as Mock;
const mockTicketOrderFindUnique = prisma.ticketOrder.findUnique as unknown as Mock;
const mockTicketOrderUpdateMany = prisma.ticketOrder.updateMany as unknown as Mock;
const mockTicketPaymentUpdateMany = prisma.ticketPayment.updateMany as unknown as Mock;
const mockTicketUpdateMany = prisma.ticket.updateMany as unknown as Mock;
const mockVoucherOrderFindMany = prisma.voucherOrder.findMany as unknown as Mock;
const mockVoucherOrderFindUnique = prisma.voucherOrder.findUnique as unknown as Mock;
const mockVoucherOrderUpdateMany = prisma.voucherOrder.updateMany as unknown as Mock;
const mockVoucherPaymentUpdateMany = prisma.voucherPayment.updateMany as unknown as Mock;
const mockProductUpdate = prisma.product.update as unknown as Mock;
const mockGalleryFindMany = prisma.gallery.findMany as unknown as Mock;
const mockGalleryDeleteMany = prisma.gallery.deleteMany as unknown as Mock;
const mockGalleryLikesDeleteMany = prisma.galleryLikes.deleteMany as unknown as Mock;
const mockFavoriteEventDeleteMany = prisma.favoriteEvent.deleteMany as unknown as Mock;
const mockReviewFindMany = prisma.review.findMany as unknown as Mock;
const mockReviewDeleteMany = prisma.review.deleteMany as unknown as Mock;
const mockReviewGroupBy = prisma.review.groupBy as unknown as Mock;
const mockCartDeleteMany = prisma.cart.deleteMany as unknown as Mock;
const mockNotificationDeleteMany = prisma.notification.deleteMany as unknown as Mock;
const mockNotificationPreferenceDeleteMany = prisma.notificationPreference.deleteMany as unknown as Mock;
const mockNewsletterDeleteMany = prisma.newsletter.deleteMany as unknown as Mock;
const mockSessionDeleteMany = prisma.session.deleteMany as unknown as Mock;
const mockProfileDeleteMany = prisma.profile.deleteMany as unknown as Mock;
const mockEventUpdate = prisma.event.update as unknown as Mock;

/* - Funções e dados auxiliares - */

const userId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-06-01T12:00:00.000Z");
const profilePictureUrl = "https://blob.test/profile.png";
const galleryImageUrl = "https://blob.test/gallery-1.png";
const otherGalleryImageUrl = "https://blob.test/gallery-2.png";
const hashedPassword = "hashed password";
const paymentCreatedAt = new Date("2026-05-30T10:00:00.000Z");

const buildValidSession = () => ({ session: { id: "session 1" }, user: { id: "admin 1", name: "Admin", email: "admin@email.com", role: "admin" } });

const buildDatabaseUser = (overrides: Record<string, unknown> = {}) => ({
  profilePicture: profilePictureUrl,
  role: "user",
  ...overrides,
});

const buildPayment = (overrides: Record<string, unknown> = {}) => ({
  id: "payment 1",
  status: "pending",
  method: "creditCard",
  createdAt: paymentCreatedAt,
  ...overrides,
});

const buildPendingTicketOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "ticket order 1",
  status: "pending",
  ticketPayments: [buildPayment({ id: "ticket payment 1" })],
  tickets: [],
  ...overrides,
});

const buildPendingVoucherOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "voucher order 1",
  status: "pending",
  voucherPayments: [buildPayment({ id: "voucher payment 1", method: "pix" })],
  vouchers: [
    { productId: "product 1", quantity: 2 },
    { productId: "product 2", quantity: 1 },
  ],
  ...overrides,
});

const buildGallery = (overrides: Record<string, unknown> = {}) => ({
  id: "gallery 1",
  image: galleryImageUrl,
  ...overrides,
});

// O _avg.rating do Prisma é Decimal, por isso o mock tem o método toNumber

const buildRatingAverage = (eventId: string, rating: number | null) => ({
  eventId,
  _avg: { rating: rating === null ? null : { toNumber: () => rating } },
});

// A primeira transação (com callback) cancela os pedidos pendentes. A segunda (com array) anonimiza o usuário

const getAnonymizationQueries = () => mockTransaction.mock.calls.map(([argument]) => argument).find(Array.isArray) as unknown[];

const failAnonymizationTransaction = () => {
  mockTransaction.mockImplementation(async (argument: unknown) => {
    if (Array.isArray(argument)) {
      throw new Error("db error");
    }

    return typeof argument === "function" ? argument(prisma) : argument;
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockValidateSession.mockResolvedValue(buildValidSession());
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser());
  mockUserCount.mockResolvedValue(1);
  mockUserUpdate.mockReturnValue("user update query");
  mockTicketFindFirst.mockResolvedValue(null);
  mockVoucherFindFirst.mockResolvedValue(null);
  mockTicketOrderFindMany.mockResolvedValue([]);
  mockVoucherOrderFindMany.mockResolvedValue([]);
  mockExpireStripeCheckoutSessions.mockResolvedValue(true);
  mockTicketOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockTicketOrderFindUnique.mockResolvedValue({ status: "cancelled" });
  mockTicketPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockTicketUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherOrderFindUnique.mockResolvedValue({ status: "cancelled" });
  mockVoucherPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockProductUpdate.mockResolvedValue({});
  mockTransaction.mockImplementation(async (argument: unknown) => (typeof argument === "function" ? argument(prisma) : argument));
  mockHash.mockResolvedValue(hashedPassword);
  mockGalleryFindMany.mockResolvedValue([]);
  mockReviewFindMany.mockResolvedValue([]);
  mockReviewGroupBy.mockResolvedValue([]);
  mockEventUpdate.mockResolvedValue({});
  mockDel.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando a validação e a sessão - */

test.each([
  ["an empty id", ""],
  ["an id that is not a uuid", "not-a-uuid"],
])("should return false and skip the session and the database when the input has %s", async (_description, invalidId) => {
  const result = await makeAnonymous(invalidId);

  expect(result).toBe(false);
  expect(mockValidateSession).not.toHaveBeenCalled();
  expect(mockUserFindUnique).not.toHaveBeenCalled();
});

test("should return false and skip the database when there is no valid session", async () => {
  mockValidateSession.mockResolvedValue(false);

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
  expect(mockUserFindUnique).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("should look for the user to anonymize by id", async () => {
  await makeAnonymous(userId);

  expect(mockUserFindUnique).toHaveBeenCalledTimes(1);
  expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { id: userId }, select: { profilePicture: true, role: true } });
});

test("should return false and skip the anonymization when the user does not exist", async () => {
  mockUserFindUnique.mockResolvedValue(null);

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
  expect(mockTicketFindFirst).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

/* - Testando a proteção do último administrador - */

test("should count the other admins when the user is an admin", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ role: "admin" }));

  await makeAnonymous(userId);

  expect(mockUserCount).toHaveBeenCalledTimes(1);
  expect(mockUserCount).toHaveBeenCalledWith({ where: { role: "admin", id: { not: userId } } });
});

test("should return last_admin and skip the anonymization when the user is the only admin", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ role: "admin" }));
  mockUserCount.mockResolvedValue(0);

  const result = await makeAnonymous(userId);

  expect(result).toBe("last_admin");
  expect(mockTicketFindFirst).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

test("should anonymize an admin when there is another admin", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ role: "admin" }));
  mockUserCount.mockResolvedValue(1);

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockUserUpdate).toHaveBeenCalledTimes(1);
});

test("should skip the admin count when the user is not an admin", async () => {
  await makeAnonymous(userId);

  expect(mockUserCount).not.toHaveBeenCalled();
});

/* - Testando o bloqueio por ingressos e vouchers ativos - */

test("should look for an active ticket from a future event with a confirmed payment", async () => {
  await makeAnonymous(userId);

  expect(mockTicketFindFirst).toHaveBeenCalledTimes(1);
  expect(mockTicketFindFirst).toHaveBeenCalledWith({
    where: {
      userId,
      status: "active",
      event: { startsAt: { gt: now } },
      order: { ticketPayments: { some: { status: "confirmed" } } },
    },
    select: { id: true },
  });
});

test("should look for an active voucher with a confirmed payment that was not picked up", async () => {
  await makeAnonymous(userId);

  expect(mockVoucherFindFirst).toHaveBeenCalledTimes(1);
  expect(mockVoucherFindFirst).toHaveBeenCalledWith({
    where: {
      userId,
      status: "active",
      order: { voucherPayments: { some: { status: "confirmed", pickedUpAt: null } } },
    },
    select: { id: true },
  });
});

test.each([
  ["an active ticket", () => mockTicketFindFirst.mockResolvedValue({ id: "ticket 1" })],
  ["an active voucher", () => mockVoucherFindFirst.mockResolvedValue({ id: "voucher 1" })],
])("should return active_orders and skip the anonymization when the user has %s", async (_description, setupBlock) => {
  setupBlock();

  const result = await makeAnonymous(userId);

  expect(result).toBe("active_orders");
  expect(mockTicketOrderFindMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderFindMany).not.toHaveBeenCalled();
  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

/* - Testando a expiração das sessões do Stripe - */

test("should look for the pending ticket orders and voucher orders of the user", async () => {
  await makeAnonymous(userId);

  expect(mockTicketOrderFindMany).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderFindMany).toHaveBeenCalledWith({
    where: { userId, status: "pending" },
    include: { ticketPayments: true, tickets: true },
  });
  expect(mockVoucherOrderFindMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderFindMany).toHaveBeenCalledWith({
    where: { userId, status: "pending" },
    include: { voucherPayments: true, vouchers: true },
  });
});

test("should expire the Stripe sessions only of the payments that are pending and not paid in cash", async () => {
  mockTicketOrderFindMany.mockResolvedValue([
    buildPendingTicketOrder({
      ticketPayments: [
        buildPayment({ id: "ticket payment 1", method: "creditCard" }),
        buildPayment({ id: "ticket payment 2", method: "cash" }),
        buildPayment({ id: "ticket payment 3", status: "cancelled" }),
      ],
    }),
  ]);
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);

  await makeAnonymous(userId);

  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledTimes(2);
  expect(mockExpireStripeCheckoutSessions).toHaveBeenNthCalledWith(1, "ticket payment 1", paymentCreatedAt);
  expect(mockExpireStripeCheckoutSessions).toHaveBeenNthCalledWith(2, "voucher payment 1", paymentCreatedAt);
});

test("should skip the Stripe sessions when the user has no pending orders", async () => {
  await makeAnonymous(userId);

  expect(mockExpireStripeCheckoutSessions).not.toHaveBeenCalled();
});

test("should return active_orders and skip the cancellation when a Stripe session was already paid", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockExpireStripeCheckoutSessions.mockResolvedValue(false);

  const result = await makeAnonymous(userId);

  expect(result).toBe("active_orders");
  expect(mockTransaction).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

test("should stop at the first Stripe session that was already paid", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);
  mockExpireStripeCheckoutSessions.mockResolvedValue(false);

  await makeAnonymous(userId);

  expect(mockExpireStripeCheckoutSessions).toHaveBeenCalledTimes(1);
});

test("should expire the Stripe sessions before cancelling the pending orders", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);

  await makeAnonymous(userId);

  expect(mockExpireStripeCheckoutSessions.mock.invocationCallOrder[0]).toBeLessThan(mockTransaction.mock.invocationCallOrder[0]);
});

/* - Testando o cancelamento dos pedidos de ingressos pendentes - */

test("should cancel the pending ticket order with its payments and tickets", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);

  await makeAnonymous(userId);

  expect(mockTicketOrderUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderUpdateMany).toHaveBeenCalledWith({ where: { id: "ticket order 1", status: "pending" }, data: { status: "cancelled" } });
  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledWith({
    where: { orderId: "ticket order 1", status: "pending" },
    data: { status: "cancelled" },
  });
  expect(mockTicketUpdateMany).toHaveBeenCalledWith({ where: { orderId: "ticket order 1", status: "active" }, data: { status: "cancelled" } });
});

test("should cancel every pending ticket order of the user", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder(), buildPendingTicketOrder({ id: "ticket order 2" })]);

  await makeAnonymous(userId);

  expect(mockTicketOrderUpdateMany).toHaveBeenCalledTimes(2);
  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledTimes(2);
  expect(mockTicketUpdateMany).toHaveBeenCalledTimes(2);
});

test("should still cancel the payments and tickets when the webhook already cancelled the ticket order", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockTicketOrderUpdateMany.mockResolvedValue({ count: 0 });
  mockTicketOrderFindUnique.mockResolvedValue({ status: "cancelled" });

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockTicketOrderFindUnique).toHaveBeenCalledWith({ where: { id: "ticket order 1" }, select: { status: true } });
  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockTicketUpdateMany).toHaveBeenCalledTimes(1);
});

test.each([
  ["the ticket order was paid in the meantime", { status: "confirmed" }],
  ["the ticket order no longer exists", null],
])("should return false and skip the anonymization when %s", async (_description, currentOrder) => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockTicketOrderUpdateMany.mockResolvedValue({ count: 0 });
  mockTicketOrderFindUnique.mockResolvedValue(currentOrder);

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

test("should skip the ticket order lookup when the ticket order was cancelled by this call", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);

  await makeAnonymous(userId);

  expect(mockTicketOrderFindUnique).not.toHaveBeenCalled();
});

/* - Testando o cancelamento dos pedidos de vouchers pendentes - */

test("should cancel the pending voucher order with its payments", async () => {
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);

  await makeAnonymous(userId);

  expect(mockVoucherOrderUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderUpdateMany).toHaveBeenCalledWith({ where: { id: "voucher order 1", status: "pending" }, data: { status: "cancelled" } });
  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledWith({
    where: { orderId: "voucher order 1", status: "pending" },
    data: { status: "cancelled" },
  });
});

test("should return the reserved stock of each voucher to its product", async () => {
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);

  await makeAnonymous(userId);

  expect(mockProductUpdate).toHaveBeenCalledTimes(2);
  expect(mockProductUpdate).toHaveBeenNthCalledWith(1, { where: { id: "product 1" }, data: { quantity: { increment: 2 } } });
  expect(mockProductUpdate).toHaveBeenNthCalledWith(2, { where: { id: "product 2" }, data: { quantity: { increment: 1 } } });
});

test("should not return the stock again when the webhook already cancelled the voucher order", async () => {
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);
  mockVoucherOrderUpdateMany.mockResolvedValue({ count: 0 });
  mockVoucherOrderFindUnique.mockResolvedValue({ status: "cancelled" });

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockVoucherOrderFindUnique).toHaveBeenCalledWith({ where: { id: "voucher order 1" }, select: { status: true } });
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

test.each([
  ["the voucher order was paid in the meantime", { status: "confirmed" }],
  ["the voucher order no longer exists", null],
])("should return false and skip the anonymization when %s", async (_description, currentOrder) => {
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);
  mockVoucherOrderUpdateMany.mockResolvedValue({ count: 0 });
  mockVoucherOrderFindUnique.mockResolvedValue(currentOrder);

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
  expect(mockProductUpdate).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
});

test("should skip the voucher order lookup when the voucher order was cancelled by this call", async () => {
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);

  await makeAnonymous(userId);

  expect(mockVoucherOrderFindUnique).not.toHaveBeenCalled();
});

/* - Testando a anonimização do usuário - */

// O randomUUID vem do módulo nativo crypto, que não dá para mockar aqui, então o teste confere só o formato do uuid

test("should generate a random password that nobody knows and hash it", async () => {
  await makeAnonymous(userId);

  expect(mockHash).toHaveBeenCalledTimes(1);
  expect(mockHash).toHaveBeenCalledWith(expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/), 10);
});

test("should generate a different random password on each anonymization", async () => {
  await makeAnonymous(userId);
  await makeAnonymous(userId);

  expect(mockHash.mock.calls[0][0]).not.toBe(mockHash.mock.calls[1][0]);
});

test("should look for the gallery and for the reviewed events of the user", async () => {
  await makeAnonymous(userId);

  expect(mockGalleryFindMany).toHaveBeenCalledWith({ where: { userId }, select: { id: true, image: true } });
  expect(mockReviewFindMany).toHaveBeenCalledWith({ where: { userId }, select: { eventId: true }, distinct: ["eventId"] });
});

test("should delete the personal and usage data of the user in a single transaction", async () => {
  mockGalleryFindMany.mockResolvedValue([buildGallery(), buildGallery({ id: "gallery 2", image: otherGalleryImageUrl })]);

  await makeAnonymous(userId);

  expect(getAnonymizationQueries()).toHaveLength(12);
  expect(mockGalleryLikesDeleteMany).toHaveBeenCalledTimes(2);
  expect(mockGalleryLikesDeleteMany).toHaveBeenNthCalledWith(1, { where: { imageId: { in: ["gallery 1", "gallery 2"] } } });
  expect(mockGalleryDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockGalleryLikesDeleteMany).toHaveBeenNthCalledWith(2, { where: { userId } });
  expect(mockFavoriteEventDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockReviewDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockCartDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockNotificationDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockNotificationPreferenceDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockNewsletterDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockSessionDeleteMany).toHaveBeenCalledWith({ where: { userId } });
  expect(mockProfileDeleteMany).toHaveBeenCalledWith({ where: { userId } });
});

test("should anonymize the user instead of deleting it", async () => {
  await makeAnonymous(userId);

  expect(mockUserUpdate).toHaveBeenCalledTimes(1);
  expect(mockUserUpdate).toHaveBeenCalledWith({
    where: { id: userId },
    data: {
      name: "Usuário removido",
      email: `removido-${userId}@prismahall.invalid`,
      password: hashedPassword,
      token: null,
      tokenExpiresAt: null,
      profilePicture: null,
      role: "user",
      verifiedBadge: false,
      frequentUser: "none",
      oldUser: "none",
      validatedAt: null,
    },
  });
});

test("should include the user update as the last query of the anonymization transaction", async () => {
  await makeAnonymous(userId);

  expect(getAnonymizationQueries().at(-1)).toBe("user update query");
});

test("should anonymize the user only after the pending orders were cancelled", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);

  await makeAnonymous(userId);

  expect(mockTransaction).toHaveBeenCalledTimes(2);
  expect(mockTransaction.mock.calls[0][0]).toBeTypeOf("function");
  expect(Array.isArray(mockTransaction.mock.calls[1][0])).toBe(true);
});

test("should reset the role of an admin to user when anonymizing", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ role: "admin" }));

  await makeAnonymous(userId);

  expect(mockUserUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ role: "user" }) }));
});

/* - Testando o recálculo da nota dos eventos avaliados - */

test("should calculate the remaining ratings of the events that the user reviewed", async () => {
  mockReviewFindMany.mockResolvedValue([{ eventId: "event 1" }, { eventId: "event 2" }]);

  await makeAnonymous(userId);

  expect(mockReviewGroupBy).toHaveBeenCalledTimes(1);
  expect(mockReviewGroupBy).toHaveBeenCalledWith({ by: ["eventId"], where: { eventId: { in: ["event 1", "event 2"] } }, _avg: { rating: true } });
});

test("should update the rating of each event rounded to two decimal places, or 0 when it has no ratings left", async () => {
  mockReviewFindMany.mockResolvedValue([{ eventId: "event 1" }, { eventId: "event 2" }, { eventId: "event 3" }]);
  mockReviewGroupBy.mockResolvedValue([buildRatingAverage("event 1", 4.666), buildRatingAverage("event 3", null)]);

  await makeAnonymous(userId);

  expect(mockEventUpdate).toHaveBeenCalledTimes(3);
  expect(mockEventUpdate).toHaveBeenNthCalledWith(1, { where: { id: "event 1" }, data: { rating: 4.67 } });
  expect(mockEventUpdate).toHaveBeenNthCalledWith(2, { where: { id: "event 2" }, data: { rating: 0 } });
  expect(mockEventUpdate).toHaveBeenNthCalledWith(3, { where: { id: "event 3" }, data: { rating: 0 } });
});

test("should recalculate the ratings only after the user reviews were deleted", async () => {
  mockReviewFindMany.mockResolvedValue([{ eventId: "event 1" }]);

  await makeAnonymous(userId);

  expect(mockTransaction.mock.invocationCallOrder[1]).toBeLessThan(mockReviewGroupBy.mock.invocationCallOrder[0]);
});

test("should not update any event when the user has no reviews", async () => {
  await makeAnonymous(userId);

  expect(mockEventUpdate).not.toHaveBeenCalled();
});

test.each([
  ["calculating the remaining ratings", () => mockReviewGroupBy.mockRejectedValue(new Error("db error"))],
  ["updating the rating of an event", () => mockEventUpdate.mockRejectedValue(new Error("db error"))],
])("should still return true and log the error when %s fails", async (_description, setupFailure) => {
  mockReviewFindMany.mockResolvedValue([{ eventId: "event 1" }]);
  mockReviewGroupBy.mockResolvedValue([buildRatingAverage("event 1", 4)]);
  setupFailure();

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(console.error).toHaveBeenCalledWith("[makeAnonymous] Falha ao recalcular a nota dos eventos:", expect.any(Error));
});

/* - Testando a remoção das imagens do Blob - */

test("should delete the gallery images and the profile picture from the Blob", async () => {
  mockGalleryFindMany.mockResolvedValue([buildGallery(), buildGallery({ id: "gallery 2", image: otherGalleryImageUrl })]);

  await makeAnonymous(userId);

  expect(mockDel).toHaveBeenCalledTimes(1);
  expect(mockDel).toHaveBeenCalledWith([galleryImageUrl, otherGalleryImageUrl, profilePictureUrl]);
});

test("should delete only the gallery images when the user has no profile picture", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ profilePicture: null }));
  mockGalleryFindMany.mockResolvedValue([buildGallery()]);

  await makeAnonymous(userId);

  expect(mockDel).toHaveBeenCalledWith([galleryImageUrl]);
});

test("should delete only the profile picture when the user has no gallery", async () => {
  await makeAnonymous(userId);

  expect(mockDel).toHaveBeenCalledWith([profilePictureUrl]);
});

test("should skip the Blob when the user has no images", async () => {
  mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ profilePicture: null }));

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockDel).not.toHaveBeenCalled();
});

test("should delete the images from the Blob only after the user was anonymized", async () => {
  await makeAnonymous(userId);

  expect(mockTransaction.mock.invocationCallOrder[0]).toBeLessThan(mockDel.mock.invocationCallOrder[0]);
});

test("should still return true when deleting the images from the Blob fails", async () => {
  mockDel.mockRejectedValue(new Error("blob error"));

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockUserUpdate).toHaveBeenCalledTimes(1);
});

/* - Testando o resultado - */

test("should return true when the user was anonymized", async () => {
  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
});

test("should anonymize the user when the pending orders of tickets and vouchers were cancelled", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockVoucherOrderFindMany.mockResolvedValue([buildPendingVoucherOrder()]);

  const result = await makeAnonymous(userId);

  expect(result).toBe(true);
  expect(mockUserUpdate).toHaveBeenCalledTimes(1);
});

/* - Testando as falhas do banco e das dependências - */

test.each([
  ["looking for the user", () => mockUserFindUnique.mockRejectedValue(new Error("db error"))],
  [
    "counting the other admins",
    () => {
      mockUserFindUnique.mockResolvedValue(buildDatabaseUser({ role: "admin" }));
      mockUserCount.mockRejectedValue(new Error("db error"));
    },
  ],
  ["looking for an active ticket", () => mockTicketFindFirst.mockRejectedValue(new Error("db error"))],
  ["looking for an active voucher", () => mockVoucherFindFirst.mockRejectedValue(new Error("db error"))],
  ["looking for the pending ticket orders", () => mockTicketOrderFindMany.mockRejectedValue(new Error("db error"))],
  ["looking for the pending voucher orders", () => mockVoucherOrderFindMany.mockRejectedValue(new Error("db error"))],
  [
    "expiring the Stripe sessions",
    () => {
      mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
      mockExpireStripeCheckoutSessions.mockRejectedValue(new Error("stripe error"));
    },
  ],
  ["cancelling the pending orders", () => mockTransaction.mockRejectedValue(new Error("db error"))],
  ["hashing the random password", () => mockHash.mockRejectedValue(new Error("hash error"))],
  ["looking for the gallery", () => mockGalleryFindMany.mockRejectedValue(new Error("db error"))],
  ["looking for the reviewed events", () => mockReviewFindMany.mockRejectedValue(new Error("db error"))],
  ["anonymizing the user", () => failAnonymizationTransaction()],
])("should return false when %s fails", async (_description, setupFailure) => {
  setupFailure();

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
});

test("should keep the Blob images and skip the rating recalculation when the anonymization fails", async () => {
  mockReviewFindMany.mockResolvedValue([{ eventId: "event 1" }]);
  failAnonymizationTransaction();

  await makeAnonymous(userId);

  expect(mockDel).not.toHaveBeenCalled();
  expect(mockReviewGroupBy).not.toHaveBeenCalled();
  expect(mockEventUpdate).not.toHaveBeenCalled();
});

test("should skip the anonymization when cancelling the pending orders fails", async () => {
  mockTicketOrderFindMany.mockResolvedValue([buildPendingTicketOrder()]);
  mockTicketPaymentUpdateMany.mockRejectedValue(new Error("db error"));

  const result = await makeAnonymous(userId);

  expect(result).toBe(false);
  expect(mockHash).not.toHaveBeenCalled();
  expect(mockUserUpdate).not.toHaveBeenCalled();
  expect(mockDel).not.toHaveBeenCalled();
});
