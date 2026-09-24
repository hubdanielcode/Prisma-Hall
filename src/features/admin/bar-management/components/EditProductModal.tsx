"use client";

import { AnimatePresence, motion } from "motion/react";
import { createProductSchema } from "@/lib/validations/admin/bar-management/createProductSchema";
import { ImagePlus, X } from "lucide-react";
import { masks } from "@/shared/utils/functions/masks";
import { productCategoryBadges } from "@/features/admin/bar-management/types/productCategoryBadges";
import { useBlockScroll, useMobileContext } from "@/shared/hooks";
import { useBarContext } from "@/features/bar/hooks/useBarContext";
import { useRef, useState } from "react";
import z from "zod";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditableProductType = Omit<z.infer<typeof createProductSchema>, "image">;

const ProductCategories = ["beers", "cocktails", "drinks", "no_alcohol"] as const;

const EditProductModal = ({ isOpen, onClose }: EditProductModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { editProductMutation, productBeingEdited } = useBarContext();

  /* - Estados dos produtos - */

  const [productImagePreview, setProductImagePreview] = useState<string>(productBeingEdited?.image ?? "");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productQuantity, setProductQuantity] = useState<string>(productBeingEdited ? String(productBeingEdited.quantity) : "");
  const [productPrice, setProductPrice] = useState<string>(productBeingEdited ? productBeingEdited.price.toFixed(2).replace(".", ",") : "");

  const [newProduct, setNewProduct] = useState<EditableProductType>({
    name: productBeingEdited?.name ?? "",
    description: productBeingEdited?.description ?? "",
    category: productBeingEdited?.category === "all_categories" ? "beers" : (productBeingEdited?.category ?? "beers"),
    quantity: productBeingEdited?.quantity ? Number(productBeingEdited.quantity) : 0,
    price: productBeingEdited ? Number(productBeingEdited.price) : 0,
    status: productBeingEdited?.status ?? "inactive",
  });

  /* - Estados de erro - */

  const [productNameError, setProductNameError] = useState<string>("");
  const [productDescriptionError, setProductDescriptionError] = useState<string>("");
  const [productCategoryError, setProductCategoryError] = useState<string>("");
  const [productImageError, setProductImageError] = useState<string>("");
  const [productSubmitError, setProductSubmitError] = useState<string>("");

  /* - Definições - */

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isActive = newProduct.status === "active";

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Permite que o admin altere a imagem do produto

  const handleChangeProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const maxFileSize = 4.5 * 1024 * 1024;
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!selectedFile) {
      return;
    }

    if (maxFileSize < selectedFile.size) {
      setProductImageError("A imagem deve ter um tamanho de, no máximo, 4.5MB.");
      e.target.value = "";
      return;
    }

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setProductImageError("Formato inválido. Escolha um arquivo com formato PNG, JPG ou WebP.");
      e.target.value = "";
      return;
    }

    setProductImageError("");

    const reader = new FileReader();

    reader.onload = () => {
      setProductImagePreview(reader.result as string);
      setProductImageFile(selectedFile);
    };

    reader.onerror = () => {
      setProductImageError("Erro ao carregar a imagem.");
    };

    reader.readAsDataURL(selectedFile);
    e.target.value = "";
  };

  // 3. Edita o produto

  const handleEditProduct = async () => {
    setProductNameError("");
    setProductDescriptionError("");
    setProductCategoryError("");
    setProductImageError("");
    setProductSubmitError("");

    if (!productBeingEdited) {
      return false;
    }

    if (!newProduct.name.trim()) {
      setProductNameError("Insira um nome válido.");
      return false;
    }

    if (!newProduct.description.trim()) {
      setProductDescriptionError("Insira uma descrição válida.");
      return false;
    }

    if (!newProduct.category) {
      setProductCategoryError("Selecione uma categoria.");
      return false;
    }

    const productData = {
      productId: productBeingEdited.id,
      ...newProduct,
      ...(productImageFile ? { image: productImageFile } : {}),
    };

    const editedProduct = await editProductMutation(productData);

    if (!editedProduct) {
      setProductSubmitError("Não foi possível editar o produto. Tente novamente.");
      return false;
    }

    return true;
  };

  // 4. Reseta o formulário para os valores originais do produto

  const handleResetForm = () => {
    if (!productBeingEdited) {
      return;
    }

    setProductNameError("");
    setProductDescriptionError("");
    setProductCategoryError("");
    setProductImageError("");
    setProductSubmitError("");

    setNewProduct({
      name: productBeingEdited.name,
      description: productBeingEdited.description,
      category: productBeingEdited.category === "all_categories" ? "beers" : productBeingEdited.category,
      quantity: Number(productBeingEdited.quantity),
      price: Number(productBeingEdited.price),
      status: productBeingEdited.status,
    });
    setProductImagePreview(productBeingEdited.image);
    setProductImageFile(null);
    setProductQuantity(String(productBeingEdited.quantity));
    setProductPrice(productBeingEdited.price.toFixed(2).replace(".", ","));
  };

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
            className={`fixed z-50 my-10 ${
              isPortraitMobile
                ? "top-14 left-4 w-[calc(100%-2rem)] h-fit max-w-none mx-0 max-h-[calc(100dvh-7rem)]"
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 max-h-[calc(100dvh-7rem)] ${isLandscapeMobile ? "max-w-lg" : "max-w-xl"}`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Editar Produto</span>

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
                {productImagePreview ? (
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={productImagePreview}
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
                onChange={handleChangeProductImage}
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
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Nome do Produto</label>

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
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Descrição</label>

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

              <div className="flex flex-row gap-4">
                {/* - Quantidade - */}

                <div className={`flex flex-col gap-1.5 ${isPortraitMobile ? "flex-1 min-w-0" : "shrink-0 w-28"}`}>
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Quantidade</label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors">
                    <span className="text-[#B8860B] text-sm font-bold mr-1">Qtd</span>

                    <input
                      type="text"
                      placeholder="1"
                      className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none w-full min-w-0"
                      value={productQuantity}
                      onChange={(e) => {
                        const maskedQuantityString = masks.productQuantity(e.target.value);
                        setProductQuantity(maskedQuantityString);

                        const maskedQuantityNumber = Number(maskedQuantityString.replace(",", "."));
                        setNewProduct((prev) => ({
                          ...prev,
                          quantity: Number.isNaN(maskedQuantityNumber) ? 0 : maskedQuantityNumber,
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* - Preço - */}

                <div className={`flex flex-col gap-1.5 ${isPortraitMobile ? "flex-1 min-w-0" : "shrink-0 w-28"}`}>
                  <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Preço</label>

                  <div className="flex items-center bg-[#0A0A0A] border border-[#333] focus-within:border-[#B8860B] rounded-lg px-3 transition-colors">
                    <span className="text-[#B8860B] text-sm font-bold mr-1">R$</span>

                    <input
                      type="text"
                      placeholder="0,00"
                      className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/30 outline-none w-full min-w-0"
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
              </div>

              {/* - Categoria - */}

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Categoria</label>

                <div className="flex flex-wrap gap-2">
                  {ProductCategories.map((category) => {
                    const displayName = masks.productCategory(category);
                    const badge = productCategoryBadges[displayName];
                    const isSelected = newProduct.category === category;

                    return (
                      <motion.button
                        className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border cursor-pointer transition-colors ${
                          isSelected
                            ? `${badge.background} ${badge.border} ${badge.text}`
                            : "bg-transparent border-[#333] text-white/40 hover:border-white/30"
                        }`}
                        key={category}
                        type="button"
                        onClick={() => {
                          setNewProduct((prev) => ({
                            ...prev,
                            category,
                          }));
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {displayName}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Status - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Status</label>

                <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isActive ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]" : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                      }`}
                    />
                    <span className="text-white text-sm font-semibold">{isActive ? "Ativo" : "Inativo"}</span>
                  </div>

                  <button
                    className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${isActive ? "bg-[#B8860B]" : "bg-[#3A3A3A]"}`}
                    type="button"
                    onClick={() => {
                      setNewProduct((prev) => ({
                        ...prev,
                        status: prev.status === "active" ? "inactive" : "active",
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
              {productNameError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productNameError}
                </p>
              )}

              {productDescriptionError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productDescriptionError}
                </p>
              )}

              {productCategoryError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productCategoryError}
                </p>
              )}

              {productImageError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productImageError}
                </p>
              )}

              {productSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {productSubmitError}
                </p>
              )}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetForm}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const success = await handleEditProduct();

                  if (success) {
                    onClose();
                  }
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
