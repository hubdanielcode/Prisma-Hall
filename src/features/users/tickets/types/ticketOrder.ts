import type { EventStatus, EventTag, OrderStatus, PaymentMethod, PaymentStatus } from "@/prisma/generated/prisma/enums";

export interface TicketOrderProps {
  id: string;
  status: OrderStatus;

  tickets: {
    id: string;
    eventId: string;
    quantity: number;
    unitPrice: number;

    event: {
      id: string;
      title: string;
      tag: EventTag;
      attractionName: string;
      image: string;
      status: EventStatus;
      startsAt: string;
    };
  }[];

  payments: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    totalValue: number;
    confirmedAt: string | null;

    createdAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}
