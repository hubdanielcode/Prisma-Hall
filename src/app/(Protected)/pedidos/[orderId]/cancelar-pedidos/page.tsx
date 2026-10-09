import { CancelTicketOrder } from "@/features/users/tickets";
import { cancelVoucherOrder, getTicketOrder, getVoucherOrder } from "@/actions";
import { masks } from "@/shared/utils/functions/masks";
import { redirect } from "next/navigation";
import Link from "next/link";

interface CancelOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const CancelOrderPage = async ({ params }: CancelOrderPageProps) => {
  const { orderId } = await params;

  const ticketOrder = await getTicketOrder(orderId);
  const voucherOrder = await getVoucherOrder(orderId);

  if (ticketOrder) {
    return <CancelTicketOrder orderId={orderId} />;
  }

  if (!voucherOrder) {
    redirect("/perfil");
  }

  const latestPayment = voucherOrder.payments[0];

  const canCancel = voucherOrder.status !== "cancelled" && !voucherOrder.payments.some((payment) => payment.pickedUpAt);

  const paymentWarning =
    latestPayment?.status === "confirmed"
      ? "O pagamento deste pedido será marcado como reembolsado."
      : latestPayment?.status === "pending"
        ? "O pagamento pendente deste pedido será marcado como falho e não será cobrado."
        : "";

  async function handleVoucherCancellation() {
    "use server";

    const cancelled = await cancelVoucherOrder(orderId);

    if (cancelled) {
      redirect(`/pedidos/${orderId}/detalhes-do-pedido`);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-32 pb-14 px-4 bg-[#1A1A1A]">
      <div className="flex flex-col w-full max-w-3xl gap-6">
        <span className="text-white font-semibold text-2xl sm:text-3xl">Cancelar Pedido</span>

        <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg">
          <div className="flex flex-col gap-2 p-6 border-b border-[#B8860B60]">
            <span className="text-white font-semibold text-xl">Pedido de Vouchers</span>

            <span className="text-white/60 text-sm">Pedido #{voucherOrder.id}</span>
          </div>

          <div className="flex flex-col">
            {voucherOrder.vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="flex flex-col gap-1 px-6 py-4 border-b border-[#B8860B30] last:border-b-0"
              >
                <span className="text-white font-semibold">{voucher.product.name}</span>

                <span className="text-white/60 text-sm">Categoria: {masks.productCategory(voucher.product.category)}</span>

                <span className="text-white/60 text-sm">Quantidade: {voucher.quantity}</span>

                <span className="text-white font-semibold">R$ {(voucher.product.price * voucher.quantity).toFixed(2).replace(".", ",")}</span>
              </div>
            ))}
          </div>
        </div>

        {!canCancel ? (
          <div className="flex flex-col gap-4 p-6 bg-black border border-[#B8860B] rounded-lg">
            <span className="text-white font-semibold">Este pedido não pode mais ser cancelado.</span>

            <p className="text-white/60 text-sm">
              {voucherOrder.status === "cancelled" ? "Este pedido já foi cancelado." : "Este pedido já possui uma retirada registrada."}
            </p>

            <Link
              className="w-fit px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg hover:bg-[#222]"
              href={`/pedidos/${orderId}/detalhes-do-pedido`}
            >
              Voltar para o pedido
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 bg-black border border-[#B8860B] rounded-lg">
            <span className="text-white font-semibold">Tem certeza que deseja cancelar este pedido?</span>

            <p className="text-white/60 text-sm">Essa ação não pode ser desfeita. {paymentWarning}</p>

            <Link
              className="w-fit text-sm text-[#B8860B] hover:underline"
              href="/politica-de-reembolso"
            >
              Consultar a política de reembolso
            </Link>

            <div className="flex gap-3 ml-auto">
              <Link
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg"
                href={`/pedidos/${orderId}/detalhes-do-pedido`}
              >
                Manter Pedido
              </Link>

              <form action={handleVoucherCancellation}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-500/20 border border-red-500 rounded-lg cursor-pointer hover:bg-red-500/40"
                >
                  Confirmar Cancelamento
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelOrderPage;
