import type { ProductProps } from "../types/product";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: ProductProps;
  index: number;
  footer: React.ReactNode;
  description?: string;
}

const ProductCard = ({
  product,
  index,
  footer,
  description,
}: ProductCardProps) => {
  return (
    <motion.div
      className="group/card relative w-full h-fit md:w-90 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#B8860B] shadow-2xs hover:shadow-md shadow-[#DDAE56] hover:-translate-y-2.5 transition-transform duration-200 cursor-pointer"
      key={index}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* - Imagem - */}

      <img
        className="relative h-[70%] w-full object-cover group-hover/card:scale-110 transition-transform duration-500 overflow-hidden"
        src={product.image}
        alt={product.name}
      />

      {/* - Tag do produto - */}

      <div className="absolute top-4 left-4 px-4 py-2 min-h-fit bg-[#B8860B] border border-black/30 rounded-full">
        <span className="flex items-center justify-center text-xs font-bold text-black tracking-wider">
          {product.category}
        </span>
      </div>

      <div className="flex flex-col p-6">
        <span className="text-xl text-white font-bold p-1">{product.name}</span>

        {/* - Descrição - */}

        {description && (
          <span className="text-sm text-white/60 px-1 pt-1 pb-4">
            {description}
          </span>
        )}

        {/* - Footer do card - */}

        {footer}
      </div>
    </motion.div>
  );
};

export { ProductCard };
