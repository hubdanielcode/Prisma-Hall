import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { productCategoryBadges } from "../types/productCategoryBadges";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewProductModal = ({ isOpen, onClose }: NewProductModalProps) => {
  /* - Estados dos produtos - */

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* - Fundo escuro - */}

          <motion.div
            className="fixed inset-0 bg-black/90 z-40 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* - Card do modal - */}

          <motion.div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl mx-4 bg-black border border-[#B8860B] rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className="text-lg sm:text-xl text-white font-semibold leading-none">
                Adicionar Novo Produto
              </span>

              <motion.button
                className="flex justify-center items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            {/* - Seção da imagem - */}

            <div className="flex items-center gap-4 px-5 py-4 border-b border-[#B8860B60]">
              <div className="flex justify-center items-center h-20 w-20 border border-dashed border-[#B8860B] rounded-lg shrink-0">
                <ImagePlus className="text-[#B8860B] h-6 w-6" />
              </div>

              <motion.button
                className="flex items-center gap-2 border border-[#B8860B] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ImagePlus className="text-[#B8860B] h-4 w-4" />
                <span className="text-white/80 text-sm font-semibold">
                  Adicionar Imagem
                </span>
              </motion.button>
            </div>

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold">
                  Nome do Produto
                </label>

                <input
                  type="text"
                  placeholder="Ex: Chopp Artesanal"
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold">
                  Descrição
                </label>

                <textarea
                  rows={3}
                  placeholder="Breve descrição do produto"
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors"
                />
              </div>

              {/* - Preço e Categoria - */}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1.5 w-full sm:w-28 shrink-0">
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold">
                    Preço
                  </label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors">
                    <span className="text-[#B8860B] text-sm font-bold mr-1">
                      R$
                    </span>

                    <input
                      type="text"
                      placeholder="0,00"
                      className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold">
                    Categoria
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(productCategoryBadges).map(
                      ([name, category]) => {
                        const isSelected = selectedCategory === name;

                        return (
                          <motion.button
                            key={name}
                            type="button"
                            onClick={() => setSelectedCategory(name)}
                            className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                              isSelected
                                ? `${category.background} ${category.border} ${category.text}`
                                : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {name}
                          </motion.button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* - Status - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold">
                  Status
                </label>

                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isActive
                          ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                          : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                      }`}
                    />
                    <span className="text-white text-sm font-semibold">
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActive((prev) => !prev)}
                    className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${
                      isActive ? "bg-[#B8860B]" : "bg-[#3A3A3A]"
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 h-6 w-6 bg-white rounded-full shadow-md"
                      animate={{ left: isActive ? "26px" : "4px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Adicionar Produto
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { NewProductModal };
