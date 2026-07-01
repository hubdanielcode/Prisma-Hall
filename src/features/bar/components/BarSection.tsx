import { useBarContext } from "@/features/bar/hooks/useBarContext";
import { useCartContext } from "@/features/cart";
import { ProductCard } from "@/features/bar/components/ProductCard";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const BarSection = () => {
  /* - Puxando do context - */

  const {
    filteredProducts,
    productsCategories,
    selectedCategory,
    setSelectedCategory,
  } = useBarContext();
  const { handleAddToCart, setIsCartOpen } = useCartContext();

  return (
    <div
      className="flex flex-col w-full h-fit items-center justify-center bg-[#1A1A1A] border-t border-[#B8860B60] pt-10"
      id="bar"
    >
      {/* - Tag de bar & drinks - */}

      <motion.div
        className="inline-block px-4 py-2 mb-10 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">
          Bar & Drinks
        </span>
      </motion.div>

      {/* - Título - */}

      <motion.span
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Nosso Cardápio
      </motion.span>

      {/* - Descrição - */}

      <motion.span
        className="my-2 text-white/60 text-center text-sm sm:text-base md:text-lg mb-6"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Drinks exclusivos preparados pelos melhores bartenders da cidade.
      </motion.span>

      {/* - Filtro - */}

      <div className="flex flex-wrap pb-6 gap-3 justify-center">
        {productsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              className={`flex items-center justify-center h-12 px-4 py-2 border rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                selectedCategory === category.id
                  ? "bg-[#B8860B] hover:bg-[#DDAE56] text-black border-black"
                  : "bg-[black] hover:bg-[#333] text-white border-[#B8860B]"
              }`}
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* - Card dos drinks - */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-12">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.product_id}
            product={product}
            index={index}
            description={product.description}
            footer={
              <div className="flex justify-between items-center">
                <span className="text-xl text-[#B8860B] font-bold">
                  R$ {product.price},00
                </span>

                {/* - Botão de comprar - */}

                <motion.button
                  className="flex justify-center items-center px-4 py-2 text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleAddToCart({
                      ...product,
                      id: "",
                      type: "drinks",
                      quantity: 1,
                    });
                    setIsCartOpen(true);
                  }}
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Comprar
                </motion.button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
};

export { BarSection };
