"use client";

import { DeleteReviewModal } from "@/features/events/reviews/components/DeleteReviewModal";
import { EditReviewModal } from "@/features/events/reviews/components/EditReviewModal";
import { motion } from "motion/react";
import { ProfileReviewsActions } from "./ProfileReviewsActions";
import { ReviewCard } from "@/features/events/reviews/components/ReviewCard";
import { useEffect, useState } from "react";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useProfile } from "../hooks/useProfile";
import { useReviews } from "@/features/events/reviews/hooks/useReviews";
import type { ReviewWithDetails } from "@/features/events/reviews/types/reviews";

const ProfileReviewsSection = () => {
  /* - Puxando dos hooks - */

  const { isPortraitMobile } = useMobileContext();
  const { profile, isLoading: isLoadingProfile } = useProfile();

  /* - Estado de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Definições - */

  const itemsPerPage = 6;

  const {
    reviews,
    total,
    totalPages,
    isLoading: isLoadingReviews,
  } = useReviews(currentPage, itemsPerPage, undefined, profile ? profile.id : undefined);

  /* - Estados dos modais - */

  const [reviewBeingEdited, setReviewBeingEdited] = useState<ReviewWithDetails | null>(null);
  const [reviewBeingDeleted, setReviewBeingDeleted] = useState<ReviewWithDetails | null>(null);

  const isLoading = isLoadingProfile || isLoadingReviews;

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Se a última avaliação da página for excluída, volta para a página anterior

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6">
      {/* - Título - */}

      <div className="flex items-center justify-center w-full pb-4 sm:p-6">
        <span className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap pb-8">Minhas Avaliações</span>
      </div>

      {/* - Lista de avaliações - */}

      {isLoading && <span className="text-white/60 text-center pt-8">Carregando suas avaliações...</span>}

      {!isLoading && reviews.length === 0 && <span className="text-white/60 text-center pt-8">Você ainda não avaliou nenhum evento.</span>}

      {!isLoading && reviews.length > 0 && (
        <div className={`flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto ${isPortraitMobile ? "pb-10" : "pb-16"}`}>
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              index={index}
              footer={
                <ProfileReviewsActions
                  review={review}
                  onEdit={() => setReviewBeingEdited(review)}
                  onDelete={() => setReviewBeingDeleted(review)}
                />
              }
            />
          ))}
        </div>
      )}

      {/* - Paginação - */}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pb-16">
          <motion.button
            className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Anterior
          </motion.button>

          <span className="text-white/60 text-sm">
            {currentPage} de {totalPages} ({total} avaliações)
          </span>

          <motion.button
            className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Próxima
          </motion.button>
        </div>
      )}

      {/* - Modais - */}

      {reviewBeingEdited && (
        <EditReviewModal
          key={reviewBeingEdited.id}
          isOpen={true}
          onClose={() => setReviewBeingEdited(null)}
          review={reviewBeingEdited}
        />
      )}

      {reviewBeingDeleted && (
        <DeleteReviewModal
          key={reviewBeingDeleted.id}
          isOpen={true}
          onClose={() => setReviewBeingDeleted(null)}
          review={reviewBeingDeleted}
        />
      )}
    </div>
  );
};

export { ProfileReviewsSection };
