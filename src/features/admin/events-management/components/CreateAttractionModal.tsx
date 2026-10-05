"use client";

import { AnimatePresence, motion } from "motion/react";
import { createAttractionSchema } from "@/lib/validations";
import { ImagePlus, X } from "lucide-react";
import { masks } from "@/shared/utils";
import { useAttractionContext } from "@/features/events/event/hooks/useAttractionContext";
import { useBlockScroll, useMobileContext } from "@/shared/hooks";
import { useRef, useState } from "react";
import z from "zod";

interface CreateAttractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EmptyAttractionType = Omit<z.infer<typeof createAttractionSchema>, "image" | "description"> & {
  description: string;
  image: File | null;
};

const emptyAttraction: EmptyAttractionType = {
  name: "",
  description: "",
  image: null,
};

const CreateAttractionModal = ({ isOpen, onClose }: CreateAttractionModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { createAttractionMutation } = useAttractionContext();

  /* - Estados de atração - */

  const [attractionImagePreview, setAttractionImagePreview] = useState<string>("");
  const [newAttraction, setNewAttraction] = useState<EmptyAttractionType>(emptyAttraction);

  /* - Estados de erro - */

  const [attractionNameError, setAttractionNameError] = useState<string>("");
  const [attractionImageError, setAttractionImageError] = useState<string>("");
  const [attractionSubmitError, setAttractionSubmitError] = useState<string>("");

  /* - Definições - */

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Permite que o admin adicione a imagem da atração

  const handleAddAttractionImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const maxFileSize = 4.5 * 1024 * 1024;
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!selectedFile) {
      return;
    }

    // 2.1. Valida a imagem com relação ao seu tamanho e ao seu tipo

    if (maxFileSize < selectedFile.size) {
      setAttractionImageError("A imagem deve ter um tamanho de, no máximo, 4.5MB.");
      e.target.value = "";
      return;
    }

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setAttractionImageError("Formato inválido. Escolha um arquivo com formato PNG, JPG ou WebP.");
      e.target.value = "";
      return;
    }

    setAttractionImageError("");

    // 2.2. Salva a imagem real como file (arquivo esperado pelo prisma e pela action) e o preview como base64

    const reader = new FileReader();

    reader.onload = () => {
      setAttractionImagePreview(reader.result as string);

      setNewAttraction((prev) => ({ ...prev, image: selectedFile }));
    };

    reader.onerror = () => {
      setAttractionImageError("Erro ao carregar a imagem.");
    };

    reader.readAsDataURL(selectedFile);
    e.target.value = "";
  };

  // 3. Finaliza a atração e coloca na lista

  const handleCreateNewAttraction = async () => {
    setAttractionNameError("");
    setAttractionImageError("");
    setAttractionSubmitError("");

    if (!newAttraction.name.trim()) {
      setAttractionNameError("Insira um nome válido.");
      return false;
    }

    if (!newAttraction.image) {
      setAttractionImageError("Adicione uma imagem à atração.");
      return false;
    }

    const createdAttraction = await createAttractionMutation({
      name: newAttraction.name,
      description: newAttraction.description.trim() ? newAttraction.description : undefined,
      image: newAttraction.image,
    });

    if (!createdAttraction) {
      setAttractionSubmitError("Não foi possível criar a atração.");
      return false;
    }
    return true;
  };

  // 4. Limpa os campos do formulário de criação de atração

  const handleResetForm = () => {
    setAttractionNameError("");
    setAttractionImageError("");
    setAttractionSubmitError("");
    setNewAttraction(emptyAttraction);
    setAttractionImagePreview("");
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
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 max-h-[calc(100dvh-7rem)] ${
                    isLandscapeMobile ? "max-w-lg" : "max-w-xl"
                  }`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Adicionar Nova Atração</span>

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
                {attractionImagePreview ? (
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={attractionImagePreview}
                    alt="Preview da atração"
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
                onChange={handleAddAttractionImage}
              />

              <motion.button
                className="flex items-center gap-2 border border-[#B8860B] px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="text-[#B8860B] h-4 w-4" />

                <span className="text-white/80 text-sm font-semibold">Adicionar Imagem</span>
              </motion.button>
            </div>

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              {/* - Nome - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Nome da Atração</label>

                <input
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                  type="text"
                  placeholder="Ex: Banda Magníficos"
                  value={newAttraction.name}
                  onChange={(e) =>
                    setNewAttraction((prev) => ({
                      ...prev,
                      name: masks.eventTitle(e.target.value),
                    }))
                  }
                />
              </div>

              {/* - Descrição - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Descrição</label>

                <textarea
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors"
                  rows={3}
                  placeholder="Breve descrição da atração (opcional)"
                  value={newAttraction.description}
                  onChange={(e) =>
                    setNewAttraction((prev) => ({
                      ...prev,
                      description: masks.eventDescription(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {attractionNameError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {attractionNameError}
                </p>
              )}

              {attractionImageError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {attractionImageError}
                </p>
              )}

              {attractionSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {attractionSubmitError}
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
                  const success = await handleCreateNewAttraction();

                  if (success) {
                    handleResetForm();
                    onClose();
                  }
                }}
              >
                Adicionar Atração
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CreateAttractionModal };
