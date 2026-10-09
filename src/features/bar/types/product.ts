import { ProductCategory, ProductStatus } from "@/prisma/generated/prisma/enums";

export type ProductProps = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  quantity: number;
  image: string;
  price: number;
  status: ProductStatus;

  createdAt: string;
  updatedAt: string;
};
