"use client";

import { AnimatePresence, motion } from "motion/react";
import { formattedDateToString } from "@/shared/utils/functions/dates";
import { useGallery } from "@/features/events/gallery/hooks/useGallery";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useState } from "react";
import { X } from "lucide-react";
import type { GalleryPictureProps } from "@/features/events/gallery/types/galleryPicture";

interface DeleteGalleryPictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  picture: GalleryPictureProps;
}

const DeleteGalleryPictureModal = ({ isOpen, onClose, picture }: DeleteGalleryPictureModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { deletePictureMutation } = useGallery();

  /* - Estados de erro - */

  const [pictureSubmitError, setPictureSubmitError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /* - Funções - */

  // 1. Exclui a foto

  const handleDeletePicture = async () => {
    setPictureSubmitError("");
    setIsDeleting(true);

    try {
      const deletedPicture = await deletePictureMutation(picture.id);

      if (!deletedPicture) {
        setPictureSubmitError("Não foi possível excluir a foto. Tente novamente.");
        return false;
      }

      return true;
    } catch {
      setPictureSubmitError("Não foi possível excluir a foto. Tente novamente.");
      return false;
    } finally {
      setIsDeleting(false);
    }
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
            className={`fixed z-50 ${
              isPortraitMobile
                ? "top-5 w-full h-fit max-w-none mx-0"
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 ${isLandscapeMobile ? "max-w-lg" : "max-w-xl"}`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden max-h-dh overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Excluir Foto</span>

              <motion.button
                className="flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            <div className="p-3 flex flex-col items-center justify-center">
              <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base pt-3 pb-6">
                Tem certeza que deseja excluir esta foto?
              </span>

              {/* - Foto que vai ser excluída - */}

              <div className="flex justify-center items-start w-fit bg-[#0A0A0A] border border-[#B8860B60] rounded-lg p-5">
                <img
                  className="h-18 w-18 object-cover border border-[#B8860B] rounded-lg shrink-0"
                  src={picture.image}
                  alt={picture.title}
                />

                <div className="flex flex-col pl-3 gap-y-3">
                  <span className="text-white font-bold text-sm leading-tight">{picture.title}</span>

                  <span className="text-white/50 text-xs leading-snug">{formattedDateToString(new Date(picture.happenedAt))}</span>

                  <span className="text-white/50 text-xs leading-snug">
                    {picture.likes} {picture.likes === 1 ? "curtida" : "curtidas"}
                  </span>
                </div>
              </div>

              <span className="text-red-600/80 font-semibold text-sm sm:text-base md:text-base pt-6 pb-3">
                Essa ação é permanente e não pode ser desfeita.
              </span>

              {/* - Seção de erro - */}

              <div className="min-h-20 w-full px-5">
                {pictureSubmitError && (
                  <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                    {pictureSubmitError}
                  </p>
                )}
              </div>
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-white hover:text-[#FF9595] font-semibold bg-[#440606] border border-[#DF1212] rounded-lg cursor-pointer hover:shadow-sm shadow-[#FF9595] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isDeleting}
                onClick={async () => {
                  const success = await handleDeletePicture();

                  if (success) {
                    onClose();
                  }
                }}
              >
                {isDeleting ? "Excluindo..." : "Excluir Foto"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { DeleteGalleryPictureModal };
