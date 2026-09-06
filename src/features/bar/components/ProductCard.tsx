import { masks } from "@/shared";
import type { ProductProps } from "../types/product";
import { MotionCard } from "./MotionCard";
import Image from "next/image";

interface ProductCardProps {
  product: ProductProps;
  index: number;
  footer: React.ReactNode;
  description?: string;
}

const ProductCard = ({ product, index, footer, description }: ProductCardProps) => {
  const displayName = masks.productCategory(product.category);

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

      <div className="absolute top-4 left-4 px-4 py-2 min-h-fit bg-[#B8860B] border border-black/30 rounded-full">
        <span className="flex items-center justify-center text-xs font-bold tracking-wider">{displayName}</span>
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
