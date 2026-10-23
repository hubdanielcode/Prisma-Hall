import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/prisma/generated/prisma/enums";

export type PickupOrderType = "tickets" | "vouchers";
export type PickupBlockReason = "order_cancelled" | "payment_pending" | "payment_not_confirmed" | "already_picked_up";

export interface PickupOrderProps {
  id: string;
  type: PickupOrderType;
  status: OrderStatus;

  user: {
    name: string;
    email: string;
  };

  items: {
    id: string;
    name: string;
    quantity: number;
  }[];

  payment: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    totalValue: number;
    confirmedAt: string | null;
    pickedUpAt: string | null;
  } | null;

  blockReason: PickupBlockReason | null;
  createdAt: string;
}
