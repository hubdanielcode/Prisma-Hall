import type { ProductProps } from "@/features/bar/types/product";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma/enums";

export interface VoucherProps {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  pickedUpAt: string | null;
  product: Pick<ProductProps, "id" | "name" | "category" | "description" | "image" | "price">;

  createdAt: string;
  updatedAt: string;
}
