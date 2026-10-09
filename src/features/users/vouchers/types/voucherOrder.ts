import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/prisma/generated/prisma/enums";
import type { VoucherProps } from "@/features/users/vouchers/types/voucher";

export interface VoucherOrderProps {
  id: string;
  status: OrderStatus;

  vouchers: {
    id: string;
    productId: string;
    quantity: number;

    product: VoucherProps["product"];
  }[];

  payments: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    totalValue: number;
    pickedUpAt: string | null;
    createdAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}
