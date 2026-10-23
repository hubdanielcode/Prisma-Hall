import type { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma/enums";

type PickupBlockReason = "order_cancelled" | "payment_pending" | "payment_not_confirmed" | "already_picked_up";

interface PickupPayment {
  status: PaymentStatus;
  pickedUpAt: Date | string | null;
}

/* - Regra única da retirada, usada pela busca e pelo registro: só pedido não cancelado, com pagamento confirmado e ainda não retirado pode ser retirado - */

const getPickupBlockReason = (orderStatus: OrderStatus, payments: PickupPayment[]): PickupBlockReason | null => {
  // 1. Pedido cancelado nunca é retirado, mesmo que o pagamento ainda apareça como confirmado

  if (orderStatus === "cancelled") {
    return "order_cancelled";
  }

  // 2. Com pagamento confirmado, a única coisa que impede é a retirada já ter sido registrada

  const confirmedPayment = payments.find((payment) => payment.status === "confirmed");

  if (confirmedPayment) {
    return confirmedPayment.pickedUpAt ? "already_picked_up" : null;
  }

  // 3. Sem pagamento confirmado: pendente (ainda pode ser pago) ou sem nenhum pagamento válido (falhou, cancelado, reembolsado ou inexistente)

  return payments.some((payment) => payment.status === "pending") ? "payment_pending" : "payment_not_confirmed";
};

export { getPickupBlockReason, type PickupBlockReason };
