import type { EventProps } from "@/features/events/event/types/event";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma/enums";

export interface TicketProps {
  id: string;
  orderId: string;
  eventId: string;
  quantity: number;
  unitPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  pickedUpAt: string | null;
  event: EventProps;

  createdAt: string;
  updatedAt: string;
}
