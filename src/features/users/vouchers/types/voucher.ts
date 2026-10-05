import type { ProductProps } from "@/features/bar/types/product";

export interface VoucherProps {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  orderStatus: "pending" | "confirmed" | "cancelled";
  paymentStatus: "confirmed" | "pending" | "failed" | "refunded";
  pickedUpAt: string | null;
  product: Pick<ProductProps, "id" | "name" | "category" | "description" | "image" | "price">;

  createdAt: string;
  updatedAt: string;
}
