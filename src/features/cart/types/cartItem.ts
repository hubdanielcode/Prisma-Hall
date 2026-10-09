import type { EventStatus, ItemType, ProductCategory, ProductStatus } from "@/prisma/generated/prisma/enums";

export interface CartItemProps {
  id: string;
  type: ItemType;
  productId: string | null;
  eventId: string | null;
  quantity: number;
  price: number;

  product: {
    id: string;
    name: string;
    category: ProductCategory;
    image: string;
    quantity: number;
    status: ProductStatus;
  } | null;

  event: {
    id: string;
    title: string;
    attractionName: string;
    image: string;
    startsAt: string;
    status: EventStatus;
  } | null;

  createdAt: string;
  updatedAt: string;
}
