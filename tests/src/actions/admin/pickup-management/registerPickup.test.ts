import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { registerPickup } from "@/actions/admin/pickup-management/registerPickup";
import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { getPickupBlockReason } from "@/lib/server/orders/getPickupBlockReason";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (checkIsAdmin e prisma vêm do vitest.setup) - */

vi.mock("@/lib/server/orders/getPickupBlockReason", () => ({ getPickupBlockReason: vi.fn() }));

const mockCheckIsAdmin = checkIsAdmin as unknown as Mock;
const mockGetPickupBlockReason = getPickupBlockReason as unknown as Mock;
const mockFindUniqueTicketOrder = prisma.ticketOrder.findUnique as unknown as Mock;
const mockFindUniqueVoucherOrder = prisma.voucherOrder.findUnique as unknown as Mock;
const mockUpdateManyTicketPayments = prisma.ticketPayment.updateMany as unknown as Mock;
const mockUpdateManyVoucherPayments = prisma.voucherPayment.updateMany as unknown as Mock;

/* - Funções e dados auxiliares - */

type RegisterPickupInput = Parameters<typeof registerPickup>[0];

const orderId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-01-15T18:00:00.000Z");

const buildInput = (overrides: Partial<RegisterPickupInput> = {}): RegisterPickupInput => ({
  orderId,
  type: "tickets",
  ...overrides,
});

const ticketPayments = [{ status: "confirmed", pickedUpAt: null }];
const voucherPayments = [{ status: "confirmed", pickedUpAt: null }];

// O filtro do updateMany só atinge pagamento confirmado, ainda não retirado e de pedido não cancelado

const expectedUpdate = {
  where: { orderId, status: "confirmed", pickedUpAt: null, order: { status: { not: "cancelled" } } },
  data: { pickedUpAt: now },
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  mockCheckIsAdmin.mockResolvedValue(true);
  mockGetPickupBlockReason.mockReturnValue(null);
  mockFindUniqueTicketOrder.mockResolvedValue({ status: "confirmed", ticketPayments });
  mockFindUniqueVoucherOrder.mockResolvedValue({ status: "confirmed", voucherPayments });
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 1 });
  mockUpdateManyVoucherPayments.mockResolvedValue({ count: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

/* - Testando permissão e validação - */

test("should return false and skip the database when the user is not an admin", async () => {
  mockCheckIsAdmin.mockResolvedValue(false);

  const result = await registerPickup(buildInput());

  expect(result).toBe(false);
  expect(mockFindUniqueTicketOrder).not.toHaveBeenCalled();
  expect(mockFindUniqueVoucherOrder).not.toHaveBeenCalled();
  expect(mockUpdateManyTicketPayments).not.toHaveBeenCalled();
  expect(mockUpdateManyVoucherPayments).not.toHaveBeenCalled();
});

test.each([
  ["an empty order id", { orderId: "" }],
  ["an order id that is not a uuid", { orderId: "not-a-uuid" }],
  ["an unknown type", { type: "invalid" }],
])("should return false and skip the database when the input has %s", async (_description, invalidInput) => {
  const result = await registerPickup(buildInput(invalidInput as never));

  expect(result).toBe(false);
  expect(mockFindUniqueTicketOrder).not.toHaveBeenCalled();
  expect(mockFindUniqueVoucherOrder).not.toHaveBeenCalled();
  expect(mockUpdateManyTicketPayments).not.toHaveBeenCalled();
  expect(mockUpdateManyVoucherPayments).not.toHaveBeenCalled();
});

/* - Testando as consultas ao banco - */

test("should look for the ticket order with its payments and skip the voucher tables", async () => {
  await registerPickup(buildInput());

  expect(mockFindUniqueTicketOrder).toHaveBeenCalledWith({
    where: { id: orderId },
    select: { status: true, ticketPayments: { select: { status: true, pickedUpAt: true } } },
  });
  expect(mockFindUniqueVoucherOrder).not.toHaveBeenCalled();
});

test("should look for the voucher order with its payments and skip the ticket tables", async () => {
  await registerPickup(buildInput({ type: "vouchers" }));

  expect(mockFindUniqueVoucherOrder).toHaveBeenCalledWith({
    where: { id: orderId },
    select: { status: true, voucherPayments: { select: { status: true, pickedUpAt: true } } },
  });
  expect(mockFindUniqueTicketOrder).not.toHaveBeenCalled();
});

test("should get the block reason from the order status and the ticket payments", async () => {
  mockFindUniqueTicketOrder.mockResolvedValue({ status: "pending", ticketPayments });

  await registerPickup(buildInput());

  expect(mockGetPickupBlockReason).toHaveBeenCalledWith("pending", ticketPayments);
});

test("should get the block reason from the order status and the voucher payments", async () => {
  mockFindUniqueVoucherOrder.mockResolvedValue({ status: "cancelled", voucherPayments });

  await registerPickup(buildInput({ type: "vouchers" }));

  expect(mockGetPickupBlockReason).toHaveBeenCalledWith("cancelled", voucherPayments);
});

/* - Testando pedido inexistente - */

test.each([
  ["tickets", () => mockFindUniqueTicketOrder],
  ["vouchers", () => mockFindUniqueVoucherOrder],
])("should return order_not_found and skip the update when the %s order does not exist", async (type, getMock) => {
  getMock().mockResolvedValue(null);

  const result = await registerPickup(buildInput({ type: type as RegisterPickupInput["type"] }));

  expect(result).toBe("order_not_found");
  expect(mockGetPickupBlockReason).not.toHaveBeenCalled();
  expect(mockUpdateManyTicketPayments).not.toHaveBeenCalled();
  expect(mockUpdateManyVoucherPayments).not.toHaveBeenCalled();
});

/* - Testando o bloqueio antes da retirada - */

test.each([["order_cancelled"], ["payment_pending"], ["payment_not_confirmed"], ["already_picked_up"]])(
  "should return %s and skip the update when the pickup rule blocks the order",
  async (blockReason) => {
    mockGetPickupBlockReason.mockReturnValue(blockReason);

    const result = await registerPickup(buildInput());

    expect(result).toBe(blockReason);
    expect(mockUpdateManyTicketPayments).not.toHaveBeenCalled();
    expect(mockUpdateManyVoucherPayments).not.toHaveBeenCalled();
  },
);

/* - Testando o registro da retirada - */

test("should mark only the confirmed, not picked up payments of a not cancelled ticket order as picked up", async () => {
  await registerPickup(buildInput());

  expect(mockUpdateManyTicketPayments).toHaveBeenCalledTimes(1);
  expect(mockUpdateManyTicketPayments).toHaveBeenCalledWith(expectedUpdate);
  expect(mockUpdateManyVoucherPayments).not.toHaveBeenCalled();
});

test("should mark only the confirmed, not picked up payments of a not cancelled voucher order as picked up", async () => {
  await registerPickup(buildInput({ type: "vouchers" }));

  expect(mockUpdateManyVoucherPayments).toHaveBeenCalledTimes(1);
  expect(mockUpdateManyVoucherPayments).toHaveBeenCalledWith(expectedUpdate);
  expect(mockUpdateManyTicketPayments).not.toHaveBeenCalled();
});

test.each([["tickets"], ["vouchers"]] as const)("should return true when the pickup of the %s order is registered", async (type) => {
  const result = await registerPickup(buildInput({ type }));

  expect(result).toBe(true);
});

test("should return true when more than one payment is marked as picked up", async () => {
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 2 });

  const result = await registerPickup(buildInput());

  expect(result).toBe(true);
});

test("should not read the order again when the pickup is registered", async () => {
  await registerPickup(buildInput());

  expect(mockFindUniqueTicketOrder).toHaveBeenCalledTimes(1);
});

/* - Testando a disputa pela retirada - */

test.each([
  ["tickets", () => mockUpdateManyTicketPayments, () => mockFindUniqueTicketOrder],
  ["vouchers", () => mockUpdateManyVoucherPayments, () => mockFindUniqueVoucherOrder],
])("should read the %s order again and return the real reason when no payment is updated", async (type, getUpdateMock, getFindMock) => {
  getUpdateMock().mockResolvedValue({ count: 0 });
  mockGetPickupBlockReason.mockReturnValueOnce(null).mockReturnValueOnce("already_picked_up");

  const result = await registerPickup(buildInput({ type: type as RegisterPickupInput["type"] }));

  expect(result).toBe("already_picked_up");
  expect(getFindMock()).toHaveBeenCalledTimes(2);
});

test("should return order_cancelled when the order is cancelled right before the update", async () => {
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 0 });
  mockGetPickupBlockReason.mockReturnValueOnce(null).mockReturnValueOnce("order_cancelled");

  const result = await registerPickup(buildInput());

  expect(result).toBe("order_cancelled");
});

test("should return false when no payment is updated and the order can still be picked up", async () => {
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 0 });

  const result = await registerPickup(buildInput());

  expect(result).toBe(false);
});

test("should return false when no payment is updated and the order was deleted in the meantime", async () => {
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 0 });
  mockFindUniqueTicketOrder.mockResolvedValueOnce({ status: "confirmed", ticketPayments }).mockResolvedValueOnce(null);

  const result = await registerPickup(buildInput());

  expect(result).toBe(false);
});

/* - Testando as falhas do banco - */

test.each([
  ["reading the ticket order", () => mockFindUniqueTicketOrder, "tickets"],
  ["reading the voucher order", () => mockFindUniqueVoucherOrder, "vouchers"],
  ["updating the ticket payments", () => mockUpdateManyTicketPayments, "tickets"],
  ["updating the voucher payments", () => mockUpdateManyVoucherPayments, "vouchers"],
])("should return false when %s fails", async (_description, getMock, type) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await registerPickup(buildInput({ type: type as RegisterPickupInput["type"] }));

  expect(result).toBe(false);
});

test("should return false when reading the order again after losing the dispute fails", async () => {
  mockUpdateManyTicketPayments.mockResolvedValue({ count: 0 });
  mockFindUniqueTicketOrder.mockResolvedValueOnce({ status: "confirmed", ticketPayments }).mockRejectedValueOnce(new Error("db error"));

  const result = await registerPickup(buildInput());

  expect(result).toBe(false);
});
