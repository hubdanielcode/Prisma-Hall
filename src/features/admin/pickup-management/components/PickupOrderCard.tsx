"use client";

import { masks, orderStatusBadgeStyles, paymentStatusBadgeStyles, pickupStatusBadgeStyles } from "@/shared/utils";
import { useState } from "react";
import type { PickupBlockReason, PickupOrderProps } from "../types/pickupOrder";

interface PickupOrderCardProps {
  order: PickupOrderProps;
  onRegister: (order: PickupOrderProps) => Promise<true | false | PickupBlockReason | "order_not_found">;
}

const blockReasonMessages: Record<PickupBlockReason | "order_not_found", string> = {
  order_cancelled: "Pedido cancelado: a retirada não pode ser registrada.",
  payment_pending: "Pagamento pendente: a retirada só é liberada depois da confirmação do pagamento.",
  payment_not_confirmed: "Este pedido não tem pagamento confirmado.",
  already_picked_up: "A retirada deste pedido já foi registrada.",
  order_not_found: "Pedido não encontrado.",
};

const PickupOrderCard = ({ order, onRegister }: PickupOrderCardProps) => {
  /* - Estados de confirmação - */

  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  /* - Estados de envio - */

  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  /* - Estados de resultado - */

  const [registerError, setRegisterError] = useState<string>("");
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

  /* - Definições - */

  const paymentDisplayName = order.payment ? masks.paymentStatus(order.payment.status) : null;
  const paymentBadge = paymentDisplayName ? paymentStatusBadgeStyles[paymentDisplayName] : null;

  const isPickedUp = registerSuccess || order.blockReason === "already_picked_up";
  const pickupDisplayName = masks.pickupStatus(isPickedUp ? "pickedUp" : "notPickedUp");
  const pickupBadge = pickupStatusBadgeStyles[pickupDisplayName];

  const orderDisplayName = masks.orderStatus(order.status);
  const orderBadge = orderStatusBadgeStyles[orderDisplayName];

  const blockedMessage = !registerSuccess && order.blockReason ? blockReasonMessages[order.blockReason] : "";
  const canRegister = !registerSuccess && !order.blockReason;

  /* - Funções - */

  // 1. Registra a retirada depois da confirmação explícita e mostra o motivo caso o servidor recuse

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegisterError("");

    try {
      const result = await onRegister(order);

      if (result === true) {
        setRegisterSuccess(true);
        setIsConfirming(false);

        return;
      }

      setRegisterError(result === false ? "Não foi possível registrar a retirada. Tente novamente." : blockReasonMessages[result]);
      setIsConfirming(false);
    } catch {
      setRegisterError("Não foi possível registrar a retirada. Tente novamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg">
      {/* - Cabeçalho do pedido - */}

      <div className="flex flex-col gap-3 p-4 sm:p-6 border-b border-[#B8860B60]">
        <div className="flex flex-col">
          <span className="text-white font-semibold">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>

          <span className="text-white/60 text-xs">
            {order.user.name} · {order.user.email}
          </span>
        </div>

        {/* - Badges - */}

        <div className="flex flex-wrap gap-2">
          {paymentBadge && paymentDisplayName && (
            <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${paymentBadge.background} ${paymentBadge.border}`}>
              <span className={`text-xs font-semibold uppercase ${paymentBadge.text}`}>{paymentDisplayName}</span>
            </div>
          )}

          <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${pickupBadge.background} ${pickupBadge.border}`}>
            <span className={`text-xs font-semibold uppercase ${pickupBadge.text}`}>
              {order.payment?.pickedUpAt
                ? `${pickupDisplayName} em ${new Date(order.payment.pickedUpAt).toLocaleDateString("pt-BR")}`
                : pickupDisplayName}
            </span>
          </div>

          {order.status === "cancelled" && (
            <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${orderBadge.background} ${orderBadge.border}`}>
              <span className={`text-xs font-semibold uppercase ${orderBadge.text}`}>{orderDisplayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* - Resumo do pedido - */}

      <div className="flex flex-col">
        {order.items.map((item) => (
          <div
            className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[#B8860B30]"
            key={item.id}
          >
            <span className="text-white text-sm font-semibold">{item.name}</span>

            <span className="text-white/60 text-sm">{item.quantity}x</span>
          </div>
        ))}

        {order.payment && (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <span className="text-white/60 text-xs">
              {order.payment.confirmedAt ? `Pago em ${new Date(order.payment.confirmedAt).toLocaleDateString("pt-BR")}` : "Sem pagamento confirmado"}
            </span>

            <span className="text-white font-semibold">R$ {order.payment.totalValue.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
      </div>

      {/* - Ação - */}

      <div className="flex flex-col gap-4 p-4 sm:p-6 border-t border-[#B8860B60]">
        {blockedMessage && <p className="text-white/60 text-sm">{blockedMessage}</p>}

        {registerSuccess && <p className="text-green-400 text-sm font-semibold">Retirada registrada com sucesso.</p>}

        {registerError && <p className="text-red-500 text-sm">{registerError}</p>}

        {canRegister && !isConfirming && (
          <button
            type="button"
            className="w-fit h-10 px-4 bg-[#B8860B] hover:bg-[#DDAE56] text-black text-sm font-semibold rounded-lg cursor-pointer transition-colors"
            onClick={() => setIsConfirming(true)}
          >
            Registrar retirada
          </button>
        )}

        {/* - Confirmação explícita - */}

        {canRegister && isConfirming && (
          <div className="flex flex-col gap-4 p-4 bg-[#3D2B0A] border border-[#B8860B] rounded-lg">
            <p className="text-white text-sm">
              Confirmar a retirada do pedido #{order.id.slice(0, 8).toUpperCase()} de {order.user.name}? Depois de registrada, a retirada não pode ser
              desfeita e o pedido deixa de poder ser cancelado.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="h-10 px-4 bg-[#B8860B] hover:bg-[#DDAE56] text-black text-sm font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isRegistering}
                onClick={handleRegister}
              >
                {isRegistering ? "Registrando..." : "Confirmar retirada"}
              </button>

              <button
                type="button"
                className="h-10 px-4 bg-[#0A0A0A] border border-[#B8860B] text-white/60 hover:text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isRegistering}
                onClick={() => setIsConfirming(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PickupOrderCard };
