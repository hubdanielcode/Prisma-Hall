import type { EventProps } from "@/features/events/event/types/event";

export interface TicketProps {
  id: string;
  orderId: string;
  eventId: string;
  quantity: number;
  unitPrice: number;
  orderStatus: "pending" | "confirmed" | "cancelled";
  paymentStatus: "confirmed" | "pending" | "failed" | "refunded";
  pickedUpAt: string | null;
  event: EventProps;

  createdAt: string;
  updatedAt: string;
}
