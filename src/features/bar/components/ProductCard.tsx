import { masks } from "@/shared/utils/functions/masks";
import { MotionCard } from "./MotionCard";
import { productCategoryBadgeStyles } from "@/features/admin/bar-management/types/productCategoryBadgeStyles";
import Image from "next/image";
import type { ProductProps } from "../types/product";

interface ProductCardProps {
  product: Pick<ProductProps, "name" | "category" | "image">;
  index: number;
  footer: React.ReactNode;
  description?: string;
}

const ProductCard = ({ product, index, footer, description }: ProductCardProps) => {
  const displayName = masks.productCategory(product.category);
  const badge = productCategoryBadgeStyles[displayName];

  return (
    <MotionCard
      index={index}
      key={index}
    >
      {/* - Imagem do produto - */}

      <div className="relative h-56 w-full overflow-hidden">
        <Image
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          src={product.image}
          alt={product.name}
          fill
        />
      </div>

      {/* - Tag do produto - */}

      <div
        className={`absolute top-4 left-4 flex justify-center items-center px-2 py-1 w-fit backdrop-blur-sm border rounded-full ${badge.background} ${badge.border}`}
      >
        <span className={`flex justify-center items-center text-xs font-semibold uppercase ${badge.text}`}>{displayName}</span>
      </div>

      {/* - Nome do produto - */}

      <div className="flex flex-col p-4">
        <span className="text-xl text-white font-bold">{product.name}</span>
      </div>

      {/* - Descrição do produto - */}

      {description && <span className="text-sm text-white/60 px-1 mx-3">{description}.</span>}

      {/* - Footer do card - */}

      {footer}
    </MotionCard>
  );
};

export { ProductCard };
