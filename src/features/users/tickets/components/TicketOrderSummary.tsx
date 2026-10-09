"use client";

import { formattedDate } from "@/shared/utils/functions/dates";
import { masks } from "@/shared/utils/functions/masks";
import { orderStatusBadgeStyles, paymentStatusBadgeStyles } from "@/shared/utils/constants/orderBadgeStyles";
import type { TicketOrderProps } from "@/features/users/tickets/types/ticketOrder";

interface TicketOrderSummaryProps {
  order: TicketOrderProps;
}

const TicketOrderSummary = ({ order }: TicketOrderSummaryProps) => {
  /* - Definições - */

  // 1. As ações devolvem os pagamentos do mais recente para o mais antigo

  const latestPayment = order.payments[0];

  const orderDisplayName = masks.orderStatus(order.status);
  const orderBadge = orderStatusBadgeStyles[orderDisplayName];

  const paymentDisplayName = latestPayment ? masks.paymentStatus(latestPayment.status) : null;
  const paymentBadge = paymentDisplayName ? paymentStatusBadgeStyles[paymentDisplayName] : null;

  const subtotal = order.tickets.reduce((accumulator, ticket) => accumulator + ticket.quantity * ticket.unitPrice, 0);
  const totalValue = latestPayment ? latestPayment.totalValue : subtotal;

  const formattedPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

  return (
    <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg">
      {/* - Cabeçalho do pedido - */}

      <div className="flex flex-col gap-3 p-6 border-b border-[#B8860B60]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-white font-semibold text-xl">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>

          <span className="text-white/60 text-sm">Realizado em {new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>

        {/* - Selos - */}

        <div className="flex flex-wrap gap-2">
          <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${orderBadge.background} ${orderBadge.border}`}>
            <span className={`text-xs font-semibold uppercase ${orderBadge.text}`}>{orderDisplayName}</span>
          </div>

          {paymentBadge && paymentDisplayName && (
            <div className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${paymentBadge.background} ${paymentBadge.border}`}>
              <span className={`text-xs font-semibold uppercase ${paymentBadge.text}`}>{paymentDisplayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* - Ingressos do pedido - */}

      <div className="flex flex-col gap-4 p-6 border-b border-[#B8860B60]">
        {order.tickets.map((ticket) => {
          const date = formattedDate(ticket.event.startsAt);

          return (
            <div
              className="flex items-center gap-4"
              key={ticket.id}
            >
              <img
                className="h-16 w-16 rounded-lg border border-[#B8860B60] object-cover shrink-0"
                src={ticket.event.image}
                alt={ticket.event.title}
              />

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white font-semibold truncate">{ticket.event.title}</span>

                <span className="text-[#B8860B] text-sm font-semibold truncate">{ticket.event.attractionName}</span>

                <span className="text-white/60 text-xs">
                  {date.dayName}, {date.dayNumber} de {date.month} às {date.time}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-white/60 text-sm">
                  {ticket.quantity}x {formattedPrice(ticket.unitPrice)}
                </span>

                <span className="text-white font-semibold">{formattedPrice(ticket.quantity * ticket.unitPrice)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* - Total - */}

      <div className="flex items-center justify-between p-6">
        <span className="text-white font-semibold">Total</span>

        <span className="text-[#B8860B] font-semibold text-lg">{formattedPrice(totalValue)}</span>
      </div>
    </div>
  );
};

export { TicketOrderSummary };
