import { CancelTicketOrder } from "@/features/users/tickets/components/CancelTicketOrder";
import { CancelVoucherOrder } from "@/features/users/vouchers/components/CancelVoucherOrder";
import { getTicketOrder, getVoucherOrder } from "@/actions";
import { redirect } from "next/navigation";

interface CancelOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const CancelOrderPage = async ({ params }: CancelOrderPageProps) => {
  const { orderId } = await params;

  /* - A página só descobre o tipo do pedido; a tela de cada tipo cuida do resto (carregamento, regras, erro e cancelamento) - */

  const ticketOrder = await getTicketOrder(orderId);

  if (ticketOrder) {
    return <CancelTicketOrder orderId={orderId} />;
  }

  const voucherOrder = await getVoucherOrder(orderId);

  if (voucherOrder) {
    return <CancelVoucherOrder orderId={orderId} />;
  }

  redirect("/perfil");
};

export default CancelOrderPage;
