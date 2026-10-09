"use client";

import { IoHelp } from "react-icons/io5";
import { masks } from "@/shared/utils/functions/masks";
import { MdOutlineCancel } from "react-icons/md";
import { paymentStatusBadgeStyles } from "@/shared/utils/constants/orderBadgeStyles";
import { TicketOrderSummary } from "./TicketOrderSummary";
import { useEffect } from "react";
import { useTicketOrder } from "@/features/users/tickets/hooks/useTicketOrder";
import Link from "next/link";
import type { PaymentMethod } from "@/prisma/generated/prisma/enums";

interface TicketOrderDetailsProps {
  orderId: string;
  paymentMethod: PaymentMethod;
}

const TicketOrderDetails = ({ orderId }: TicketOrderDetailsProps) => {
  /* - Puxando do hook - */

  const { order, isLoading, error } = useTicketOrder(orderId);

  /* - Definições - */

  // 1. Enquanto a sessão não confirma, a query fica desabilitada e o order continua undefined

  const isLoadingOrder = isLoading || (order === undefined && !error);

  // 2. Espelha a regra da action: só cancela pedido ainda não cancelado e de evento que ainda não aconteceu

  const canCancel = order ? order.status !== "cancelled" && order.tickets.every((ticket) => ticket.event.status === "soon") : false;

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-32 pb-14 px-4 bg-[#1A1A1A]">
      <div className="flex flex-col w-full max-w-3xl gap-6">
        {/* - Título - */}

        <div className="flex flex-col gap-1">
          <span className="text-white font-semibold text-2xl sm:text-3xl">Detalhes do Pedido</span>

          <Link
            className="w-fit text-sm text-white/60 hover:underline"
            href="/perfil"
          >
            Voltar para meus ingressos
          </Link>
        </div>

        {/* - Estados de carregamento e erro - */}

        {isLoadingOrder && <p className="text-white/60 text-center p-12">Carregando pedido...</p>}

        {!isLoadingOrder && error && <p className="text-red-500 text-center p-12">Erro ao buscar o pedido.</p>}

        {!isLoadingOrder && !error && order === false && <p className="text-white/60 text-center p-12">Pedido não encontrado.</p>}

        {/* - Conteúdo do pedido - */}

        {!isLoadingOrder && !error && order && (
          <>
            <TicketOrderSummary order={order} />

            {/* - Histórico de pagamentos - */}

            <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg">
              <span className="text-white font-semibold text-xl p-6 border-b border-[#B8860B60]">Pagamentos</span>

              {order.payments.length === 0 && <p className="text-white/60 text-sm p-6">Nenhum pagamento registrado para este pedido.</p>}

              {order.payments.map((payment) => {
                const paymentDisplayName = masks.paymentStatus(payment.status);
                const paymentBadge = paymentStatusBadgeStyles[paymentDisplayName];

                return (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#B8860B30] last:border-b-0"
                    key={payment.id}
                  >
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{payment.method}</span>

                      <span className="text-white/60 text-xs">
                        {payment.confirmedAt
                          ? `Confirmado em ${new Date(payment.confirmedAt).toLocaleDateString("pt-BR")}`
                          : `Criado em ${new Date(payment.createdAt).toLocaleDateString("pt-BR")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex justify-center items-center px-2 py-1 w-fit border rounded-full ${paymentBadge.background} ${paymentBadge.border}`}
                      >
                        <span className={`text-xs font-semibold uppercase ${paymentBadge.text}`}>{paymentDisplayName}</span>
                      </div>

                      <span className="text-white font-semibold">R$ {payment.totalValue.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap gap-6">
              <Link
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#B8860B] uppercase"
                href="/central-de-ajuda"
              >
                <IoHelp />

                <span>Preciso de Ajuda</span>
              </Link>

              {canCancel && (
                <Link
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-[#B8860B] uppercase"
                  href={`/pedidos/${order.id}/cancelar`}
                >
                  <MdOutlineCancel />

                  <span>Cancelar Pedido</span>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { TicketOrderDetails };
