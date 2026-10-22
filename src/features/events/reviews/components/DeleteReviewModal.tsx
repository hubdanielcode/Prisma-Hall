"use client";

import { AnimatePresence, motion } from "motion/react";
import { Star, X } from "lucide-react";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useReviews } from "../hooks/useReviews";
import { useState } from "react";
import type { ReviewWithDetails } from "../types/reviews";

interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewWithDetails;
}

const DeleteReviewModal = ({ isOpen, onClose, review }: DeleteReviewModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { deleteReviewMutation } = useReviews(1, 1);

  /* - Estados de erro - */

  const [reviewSubmitError, setReviewSubmitError] = useState<string>("");

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Exclui a avaliação

  const handleDeleteReview = async () => {
    setReviewSubmitError("");

    const deletedReview = await deleteReviewMutation(review.id);

    if (!deletedReview) {
      setReviewSubmitError("Não foi possível excluir a avaliação. Tente novamente.");
      return false;
    }

    return true;
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
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Excluir Avaliação</span>

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
                Tem certeza que deseja excluir esta avaliação?
              </span>

              {/* - Avaliação que vai ser excluída - */}

              <div className="flex flex-col w-full max-w-sm gap-y-3 bg-[#0A0A0A] border border-[#B8860B60] rounded-lg p-5">
                <span className="text-[#B8860B] font-bold text-sm">{review.eventName}</span>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < Math.floor(review.rating) ? "text-[#B8860B] fill-current" : "text-gray-600 fill-current"}`}
                    />
                  ))}
                </div>

                {review.comment && <span className="text-white/50 text-xs line-clamp-3 leading-snug">{review.comment}</span>}
              </div>

              <span className="text-white/60 font-semibold text-xs sm:text-sm text-center pt-6">
                Excluir a avaliação pode mudar a nota média do evento e os seus selos.
              </span>

              <span className="text-red-600/80 font-semibold text-sm sm:text-base md:text-base pt-3 pb-3">
                Essa ação é permanente e não pode ser desfeita.
              </span>

              {/* - Seção de erro - */}

              <div className="min-h-20 w-full px-5">
                {reviewSubmitError && (
                  <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                    {reviewSubmitError}
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
                className="px-5 py-2 text-sm text-white hover:text-[#FF9595] font-semibold bg-[#440606] border border-[#DF1212] rounded-lg cursor-pointer hover:shadow-sm shadow-[#FF9595] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const success = await handleDeleteReview();

                  if (success) {
                    onClose();
                  }
                }}
              >
                Excluir Avaliação
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { DeleteReviewModal };
