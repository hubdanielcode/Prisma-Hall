import { getPickupBlockReason } from "@/lib/server";
import { expect, test } from "vitest";

/* - Funções e dados auxiliares - */

type PickupPayment = Parameters<typeof getPickupBlockReason>[1][number];

const pickedUpDate = new Date("2020-01-01T12:00:00.000Z");

const buildPayment = (overrides: Partial<PickupPayment> = {}): PickupPayment => ({
  status: "confirmed" as never,
  pickedUpAt: null,
  ...overrides,
});

const buildPendingPayment = (overrides: Partial<PickupPayment> = {}) => buildPayment({ status: "pending" as never, ...overrides });

/* - Testando o pedido cancelado - */

test.each([
  ["a confirmed payment that was not picked up", [buildPayment()]],
  ["a confirmed payment that was already picked up", [buildPayment({ pickedUpAt: pickedUpDate })]],
  ["a pending payment", [buildPendingPayment()]],
  ["no payments", []],
])("should return order_cancelled when the order is cancelled and has %s", (_description, payments) => {
  const result = getPickupBlockReason("cancelled" as never, payments);

  expect(result).toBe("order_cancelled");
});

/* - Testando o pagamento confirmado - */

test("should return null when the payment is confirmed and was not picked up", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPayment()]);

  expect(result).toBeNull();
});

test.each([
  ["a date", pickedUpDate],
  ["an ISO string", "2020-01-01T12:00:00.000Z"],
])("should return already_picked_up when the confirmed payment has the pickup registered as %s", (_description, pickedUpAt) => {
  const result = getPickupBlockReason("confirmed" as never, [buildPayment({ pickedUpAt })]);

  expect(result).toBe("already_picked_up");
});

test("should return null when there is a confirmed payment together with other payments that failed", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPayment({ status: "failed" as never }), buildPayment()]);

  expect(result).toBeNull();
});

test("should return null when there is a confirmed payment together with a pending one", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPendingPayment(), buildPayment()]);

  expect(result).toBeNull();
});

test("should return already_picked_up when the confirmed payment was picked up, even with a pending payment", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPendingPayment(), buildPayment({ pickedUpAt: pickedUpDate })]);

  expect(result).toBe("already_picked_up");
});

test("should only look at the pickup of the confirmed payment, ignoring the pickup of the other payments", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPendingPayment({ pickedUpAt: pickedUpDate }), buildPayment()]);

  expect(result).toBeNull();
});

/* - Testando a falta de pagamento confirmado - */

test("should return payment_pending when the only payment is pending", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPendingPayment()]);

  expect(result).toBe("payment_pending");
});

test("should return payment_pending when there is a pending payment together with others that failed", () => {
  const result = getPickupBlockReason("confirmed" as never, [buildPayment({ status: "failed" as never }), buildPendingPayment()]);

  expect(result).toBe("payment_pending");
});

test.each([
  ["a failed payment", [buildPayment({ status: "failed" as never })]],
  ["a cancelled payment", [buildPayment({ status: "cancelled" as never })]],
  ["a refunded payment", [buildPayment({ status: "refunded" as never })]],
  ["several payments that are not valid", [buildPayment({ status: "failed" as never }), buildPayment({ status: "refunded" as never })]],
  ["no payments", []],
])("should return payment_not_confirmed when the order has %s", (_description, payments) => {
  const result = getPickupBlockReason("confirmed" as never, payments);

  expect(result).toBe("payment_not_confirmed");
});
