import { getTicketOrder, getVoucherOrder } from "@/actions";
import { redirect } from "next/navigation";
import { TicketOrderDetails } from "@/features/users/tickets";
import { VoucherOrderDetails } from "@/features/users";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { orderId } = await params;

  const ticketOrder = await getTicketOrder(orderId);
  const voucherOrder = await getVoucherOrder(orderId);

  if (ticketOrder) {
    return (
      <TicketOrderDetails
        orderId={orderId}
        paymentMethod={ticketOrder.payments[0].method}
      />
    );
  }

  if (!voucherOrder) {
    redirect("/perfil");
  }

  return <VoucherOrderDetails orderId={orderId} />;
};

export default OrderDetailsPage;
