"use client";

import { masks } from "@/shared/utils/functions/masks";
import { orderStatusBadgeStyles, paymentStatusBadgeStyles } from "@/shared/utils/constants/orderBadgeStyles";
import type { VoucherOrderProps } from "@/features/users/vouchers/types/voucherOrder";

interface VoucherOrderSummaryProps {
  order: VoucherOrderProps;
}

const VoucherOrderSummary = ({ order }: VoucherOrderSummaryProps) => {
  /* - Definições - */

  // 1. As ações devolvem os pagamentos do mais recente para o mais antigo

  const latestPayment = order.payments[0];

  const orderDisplayName = masks.orderStatus(order.status);
  const orderBadge = orderStatusBadgeStyles[orderDisplayName];

  const paymentDisplayName = latestPayment ? masks.paymentStatus(latestPayment.status) : null;
  const paymentBadge = paymentDisplayName ? paymentStatusBadgeStyles[paymentDisplayName] : null;

  const subtotal = order.vouchers.reduce((accumulator, voucher) => accumulator + voucher.quantity * voucher.product.price, 0);
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

      {/* - Vouchers do pedido - */}

      <div className="flex flex-col gap-4 p-6 border-b border-[#B8860B60]">
        {order.vouchers.map((voucher) => (
          <div
            className="flex items-center gap-4"
            key={voucher.id}
          >
            <img
              className="h-16 w-16 rounded-lg border border-[#B8860B60] object-cover shrink-0"
              src={voucher.product.image}
              alt={voucher.product.name}
            />

            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-white font-semibold truncate">{voucher.product.name}</span>

              <span className="text-[#B8860B] text-sm font-semibold truncate">{masks.productCategory(voucher.product.category)}</span>

              <span className="text-white/60 text-xs">
                {voucher.quantity}x {formattedPrice(voucher.product.price)}
              </span>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-white font-semibold">{formattedPrice(voucher.quantity * voucher.product.price)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* - Total - */}

      <div className="flex items-center justify-between p-6">
        <span className="text-white font-semibold">Total</span>

        <span className="text-[#B8860B] font-semibold text-lg">{formattedPrice(totalValue)}</span>
      </div>
    </div>
  );
};

export { VoucherOrderSummary };
