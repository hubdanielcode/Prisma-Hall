import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { cancelUnpaidOrders } from "@/lib/server";
import { prisma } from "@/lib/server/services/prisma";

/* - Mocks das dependências externas (prisma vem do tests/setup.ts) - */

const mockTransaction = prisma.$transaction as unknown as Mock;
const mockTicketPaymentFindUnique = prisma.ticketPayment.findUnique as unknown as Mock;
const mockTicketPaymentUpdateMany = prisma.ticketPayment.updateMany as unknown as Mock;
const mockTicketOrderUpdate = prisma.ticketOrder.update as unknown as Mock;
const mockTicketUpdateMany = prisma.ticket.updateMany as unknown as Mock;
const mockVoucherPaymentFindUnique = prisma.voucherPayment.findUnique as unknown as Mock;
const mockVoucherPaymentUpdateMany = prisma.voucherPayment.updateMany as unknown as Mock;
const mockVoucherOrderUpdate = prisma.voucherOrder.update as unknown as Mock;
const mockVoucherUpdateMany = prisma.voucher.updateMany as unknown as Mock;
const mockProductUpdate = prisma.product.update as unknown as Mock;

/* - Funções e dados auxiliares - */

const ticketPaymentId = "ticket payment 1";
const voucherPaymentId = "voucher payment 1";

const buildDatabaseTicketPayment = (overrides: Record<string, unknown> = {}) => ({
  id: ticketPaymentId,
  orderId: "ticket order 1",
  status: "pending",
  ...overrides,
});

const buildDatabaseVoucherPayment = (overrides: Record<string, unknown> = {}) => ({
  id: voucherPaymentId,
  orderId: "voucher order 1",
  status: "pending",
  ...overrides,
});

const buildDatabaseVoucherOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "voucher order 1",
  status: "cancelled",
  vouchers: [
    { productId: "product 1", quantity: 2 },
    { productId: "product 2", quantity: 5 },
  ],
  ...overrides,
});

beforeEach(() => {
  // A transação recebe o próprio prisma mockado como cliente, assim os mocks dos models valem dentro dela

  mockTransaction.mockImplementation(async (callback: (transaction: typeof prisma) => Promise<unknown>) => callback(prisma));

  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment());
  mockTicketPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockTicketOrderUpdate.mockResolvedValue({});
  mockTicketUpdateMany.mockResolvedValue({ count: 3 });

  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment());
  mockVoucherPaymentUpdateMany.mockResolvedValue({ count: 1 });
  mockVoucherOrderUpdate.mockResolvedValue(buildDatabaseVoucherOrder());
  mockVoucherUpdateMany.mockResolvedValue({ count: 2 });
  mockProductUpdate.mockResolvedValue({});

  vi.spyOn(console, "error").mockImplementation(() => {});
});

/* - Testando a chamada sem pagamentos - */

test("should return true and skip every query when no payment id is given", async () => {
  const result = await cancelUnpaidOrders({});

  expect(result).toBe(true);
  expect(mockTicketPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockVoucherPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
});

test("should run everything inside a single transaction", async () => {
  await cancelUnpaidOrders({ ticketPaymentId, voucherPaymentId });

  expect(mockTransaction).toHaveBeenCalledTimes(1);
});

/* - Testando o pagamento dos ingressos: consulta ao banco - */

test("should look for the ticket payment by id", async () => {
  await cancelUnpaidOrders({ ticketPaymentId });

  expect(mockTicketPaymentFindUnique).toHaveBeenCalledTimes(1);
  expect(mockTicketPaymentFindUnique).toHaveBeenCalledWith({ where: { id: ticketPaymentId } });
});

test("should cancel the ticket payment only while it is still pending", async () => {
  await cancelUnpaidOrders({ ticketPaymentId });

  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockTicketPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: ticketPaymentId, status: "pending" },
    data: { status: "cancelled" },
  });
});

test("should cancel the ticket order of the payment", async () => {
  await cancelUnpaidOrders({ ticketPaymentId });

  expect(mockTicketOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockTicketOrderUpdate).toHaveBeenCalledWith({ where: { id: "ticket order 1" }, data: { status: "cancelled" } });
});

test("should cancel only the active tickets of the cancelled order", async () => {
  await cancelUnpaidOrders({ ticketPaymentId });

  expect(mockTicketUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockTicketUpdateMany).toHaveBeenCalledWith({
    where: { orderId: "ticket order 1", status: "active" },
    data: { status: "cancelled" },
  });
});

test("should not touch the vouchers or the stock when only the ticket payment id is given", async () => {
  await cancelUnpaidOrders({ ticketPaymentId });

  expect(mockVoucherPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockVoucherUpdateMany).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos ingressos: pagamentos ignorados - */

test("should return true and skip the updates when the ticket payment does not exist", async () => {
  mockTicketPaymentFindUnique.mockResolvedValue(null);

  const result = await cancelUnpaidOrders({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

test.each([
  ["confirmed", "confirmed"],
  ["cancelled", "cancelled"],
  ["failed", "failed"],
])("should return true and skip the updates when the ticket payment is %s", async (_description, status) => {
  mockTicketPaymentFindUnique.mockResolvedValue(buildDatabaseTicketPayment({ status }));

  const result = await cancelUnpaidOrders({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

test("should skip the order and the tickets when another request already cancelled the ticket payment", async () => {
  mockTicketPaymentUpdateMany.mockResolvedValue({ count: 0 });

  const result = await cancelUnpaidOrders({ ticketPaymentId });

  expect(result).toBe(true);
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos vouchers: consulta ao banco - */

test("should look for the voucher payment by id", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledTimes(1);
  expect(mockVoucherPaymentFindUnique).toHaveBeenCalledWith({ where: { id: voucherPaymentId } });
});

test("should cancel the voucher payment only while it is still pending", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherPaymentUpdateMany).toHaveBeenCalledWith({
    where: { id: voucherPaymentId, status: "pending" },
    data: { status: "cancelled" },
  });
});

test("should cancel the voucher order of the payment including its vouchers", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockVoucherOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderUpdate).toHaveBeenCalledWith({
    where: { id: "voucher order 1" },
    data: { status: "cancelled" },
    include: { vouchers: true },
  });
});

test("should cancel only the active vouchers of the cancelled order", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockVoucherUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherUpdateMany).toHaveBeenCalledWith({
    where: { orderId: "voucher order 1", status: "active" },
    data: { status: "cancelled" },
  });
});

test("should give back to the stock the quantity reserved for each voucher", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockProductUpdate).toHaveBeenCalledTimes(2);
  expect(mockProductUpdate).toHaveBeenCalledWith({ where: { id: "product 1" }, data: { quantity: { increment: 2 } } });
  expect(mockProductUpdate).toHaveBeenCalledWith({ where: { id: "product 2" }, data: { quantity: { increment: 5 } } });
});

test("should not update the stock when the cancelled order has no vouchers", async () => {
  mockVoucherOrderUpdate.mockResolvedValue(buildDatabaseVoucherOrder({ vouchers: [] }));

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

test("should not touch the tickets when only the voucher payment id is given", async () => {
  await cancelUnpaidOrders({ voucherPaymentId });

  expect(mockTicketPaymentFindUnique).not.toHaveBeenCalled();
  expect(mockTicketOrderUpdate).not.toHaveBeenCalled();
  expect(mockTicketUpdateMany).not.toHaveBeenCalled();
});

/* - Testando o pagamento dos vouchers: pagamentos ignorados - */

test("should return true and skip the updates when the voucher payment does not exist", async () => {
  mockVoucherPaymentFindUnique.mockResolvedValue(null);

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

test.each([
  ["confirmed", "confirmed"],
  ["cancelled", "cancelled"],
  ["failed", "failed"],
])("should return true and skip the updates and the stock when the voucher payment is %s", async (_description, status) => {
  mockVoucherPaymentFindUnique.mockResolvedValue(buildDatabaseVoucherPayment({ status }));

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherPaymentUpdateMany).not.toHaveBeenCalled();
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockVoucherUpdateMany).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

test("should not give the stock back twice when another request already cancelled the voucher payment", async () => {
  mockVoucherPaymentUpdateMany.mockResolvedValue({ count: 0 });

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(true);
  expect(mockVoucherOrderUpdate).not.toHaveBeenCalled();
  expect(mockVoucherUpdateMany).not.toHaveBeenCalled();
  expect(mockProductUpdate).not.toHaveBeenCalled();
});

/* - Testando os dois pagamentos juntos - */

test("should cancel both the ticket payment and the voucher payment when both ids are given", async () => {
  const result = await cancelUnpaidOrders({ ticketPaymentId, voucherPaymentId });

  expect(result).toBe(true);
  expect(mockTicketOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockTicketUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockVoucherOrderUpdate).toHaveBeenCalledTimes(1);
  expect(mockVoucherUpdateMany).toHaveBeenCalledTimes(1);
  expect(mockProductUpdate).toHaveBeenCalledTimes(2);
});

/* - Testando o resultado - */

test("should return true when the payment and the order are cancelled", async () => {
  const result = await cancelUnpaidOrders({ ticketPaymentId });

  expect(result).toBe(true);
});

/* - Testando as falhas do banco - */

test("should return false when the transaction fails", async () => {
  mockTransaction.mockRejectedValue(new Error("db error"));

  const result = await cancelUnpaidOrders({ ticketPaymentId, voucherPaymentId });

  expect(result).toBe(false);
});

test.each([
  ["looking for the ticket payment", () => mockTicketPaymentFindUnique],
  ["cancelling the ticket payment", () => mockTicketPaymentUpdateMany],
  ["cancelling the ticket order", () => mockTicketOrderUpdate],
  ["cancelling the tickets", () => mockTicketUpdateMany],
])("should return false when the database fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await cancelUnpaidOrders({ ticketPaymentId });

  expect(result).toBe(false);
});

test.each([
  ["looking for the voucher payment", () => mockVoucherPaymentFindUnique],
  ["cancelling the voucher payment", () => mockVoucherPaymentUpdateMany],
  ["cancelling the voucher order", () => mockVoucherOrderUpdate],
  ["cancelling the vouchers", () => mockVoucherUpdateMany],
  ["giving the stock back", () => mockProductUpdate],
])("should return false when the database fails while %s", async (_description, getMock) => {
  getMock().mockRejectedValue(new Error("db error"));

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(false);
});

test("should stop giving the stock back when one of the stock updates fails", async () => {
  mockProductUpdate.mockRejectedValueOnce(new Error("db error"));

  const result = await cancelUnpaidOrders({ voucherPaymentId });

  expect(result).toBe(false);
  expect(mockProductUpdate).toHaveBeenCalledTimes(1);
});
