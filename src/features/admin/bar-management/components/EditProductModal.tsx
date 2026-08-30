"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, X } from "lucide-react";
import { productCategoryBadges } from "../types/productCategoryBadges";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useProductsContext, type ProductProps } from "@/features/bar";
import { masks, useMobileContext } from "@/shared";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProductModal = ({ isOpen, onClose }: EditProductModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { updateProduct, productBeingEdited } = useProductsContext();

  /* - Estados dos produtos - */

  const [productImage, setProductImage] = useState<string>(productBeingEdited?.image ?? "");
  const [productPrice, setProductPrice] = useState<string>(
    productBeingEdited ? productBeingEdited.price.toFixed(2).replace(".", ",") : "",
  );
  const [newProduct, setNewProduct] = useState<Omit<ProductProps, "created_at" | "product_id">>({
    name: productBeingEdited?.name ?? "",
    description: productBeingEdited?.description ?? "",
    category: productBeingEdited?.category ?? "",
    price: productBeingEdited?.price ?? 0,
    image: productBeingEdited?.image ?? "",
    status: productBeingEdited?.status ?? "Inativo",
  });

  /* - Estados de erro - */

  const [productImageError, setProductImageError] = useState<string>("");

  /* - Definições - */

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isActive = newProduct.status === "Ativo";

  /* - Fuções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

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
            className={`fixed z-50 ${
              isPortraitMobile
                ? "top-5 w-full h-fit max-w-none mx-0"
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 ${
                    isLandscapeMobile ? "max-w-lg" : "max-w-xl"
                  }`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden max-h-dh overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span
                className={`text-white font-semibold leading-none ${
                  isPortraitMobile ? "text-lg" : "text-xl"
                }`}
              >
                Editar Produto
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
                {productImage ? (
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={productImage}
                    alt="Preview do produto"
                  />
                ) : (
                  <ImagePlus className="text-[#B8860B] h-6 w-6" />
                )}
              </div>

              <input
                className="hidden"
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
              />

              <motion.button
                className="flex items-center gap-2 border border-[#B8860B] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="text-[#B8860B] h-4 w-4" />

                <span className="text-white/80 text-sm font-semibold">Alterar Imagem</span>
              </motion.button>
            </div>

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">
                  Nome do Produto
                </label>

                <input
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                  type="text"
                  placeholder="Ex: Chopp Artesanal"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      name: masks.productName(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">
                  Descrição
                </label>

                <textarea
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors"
                  rows={3}
                  placeholder="Breve descrição do produto"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      description: masks.productDescription(e.target.value),
                    }))
                  }
                />
              </div>

              {/* - Preço - */}

              <div className={`flex gap-4 ${isPortraitMobile ? "flex-col" : "flex-row"}`}>
                <div
                  className={`flex flex-col gap-1.5 shrink-0 ${
                    isPortraitMobile ? "w-full" : "w-28"
                  }`}
                >
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">
                    Preço
                  </label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors">
                    <span className="text-[#B8860B] text-sm font-bold mr-1">R$</span>

                    <input
                      type="text"
                      placeholder="0,00"
                      className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none w-full"
                      value={productPrice}
                      onChange={(e) => {
                        const maskedPriceString = masks.productPrice(e.target.value);
                        setProductPrice(maskedPriceString);

                        const maskedPriceNumber = Number(maskedPriceString.replace(",", "."));
                        setNewProduct((prev) => ({
                          ...prev,
                          price: Number.isNaN(maskedPriceNumber) ? 0 : maskedPriceNumber,
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* - Categoria - */}

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">
                    Categoria
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(productCategoryBadges).map(([name, category]) => {
                      const isSelected = newProduct.category === name;

                      return (
                        <motion.button
                          className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                            isSelected
                              ? `${category.background} ${category.border} ${category.text}`
                              : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                          }`}
                          key={name}
                          type="button"
                          onClick={() => {
                            setNewProduct((prev) => ({
                              ...prev,
                              category: name,
                            }));
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {name}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* - Status - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">
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
                    className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${
                      isActive ? "bg-[#B8860B]" : "bg-[#3A3A3A]"
                    }`}
                    type="button"
                    onClick={() => {
                      const updateStatus = newProduct.status === "Ativo" ? "Inativo" : "Ativo";
                      setNewProduct((prev) => ({
                        ...prev,
                        status: updateStatus,
                      }));
                    }}
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

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {productImageError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productImageError}
                </p>
              )}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setNewProduct({
                    name: "",
                    description: "",
                    category: "",
                    price: 0,
                    image: "",
                    status: "Inativo",
                  });
                  setProductImage("");
                  setProductImageError("");
                  setProductPrice("");
                }}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!productBeingEdited) return;

                  await updateProduct(productBeingEdited.product_id, newProduct);
                  onClose();
                }}
              >
                Editar Produto
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { EditProductModal };
