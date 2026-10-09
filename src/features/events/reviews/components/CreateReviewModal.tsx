"use client";

import { AnimatePresence, motion } from "motion/react";
import { masks } from "@/shared/utils";
import { Star, X } from "lucide-react";
import { useBlockScroll, useMobileContext } from "@/shared/hooks";
import { useEvents } from "@/features/events/event/hooks/useEvents";
import { useReviews } from "@/features/events/reviews/hooks/useReviews";
import { useState } from "react";

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateReviewModal = ({ isOpen, onClose }: CreateReviewModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { postReviewMutation } = useReviews();
  const { events, isLoading: isLoadingEvents } = useEvents();

  /* - Estados da avaliação - */

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  /* - Estados de erro - */

  const [reviewEventError, setReviewEventError] = useState<string>("");
  const [reviewRatingError, setReviewRatingError] = useState<string>("");
  const [reviewSubmitError, setReviewSubmitError] = useState<string>("");

  /* - Definições - */

  // 1. Só dá para avaliar eventos que já aconteceram, do mais recente para o mais antigo

  const happenedEvents = [...(events ?? [])]
    .filter((event) => event.status === "happened")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Envia a avaliação

  const handleCreateReview = async () => {
    setReviewEventError("");
    setReviewRatingError("");
    setReviewSubmitError("");

    if (!selectedEventId) {
      setReviewEventError("Selecione o evento que você quer avaliar.");
      return false;
    }

    if (rating < 1) {
      setReviewRatingError("Dê uma nota de 1 a 5 estrelas.");
      return false;
    }

    const postedReview = await postReviewMutation({
      eventId: selectedEventId,
      rating: rating,
      comment: comment.trim() ? comment.trim() : undefined,
    });

    if (!postedReview) {
      setReviewSubmitError("Não foi possível enviar sua avaliação. Tente novamente.");
      return false;
    }

    return true;
  };

  // 3. Limpa os campos do formulário de avaliação

  const handleResetForm = () => {
    setReviewEventError("");
    setReviewRatingError("");
    setReviewSubmitError("");
    setSelectedEventId("");
    setRating(0);
    setHoveredRating(0);
    setComment("");
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
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Avaliar Evento</span>

              <motion.button
                className="flex justify-center items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            {/* - Corpo do modal - */}

            <div className="flex flex-col gap-4 px-5 py-4">
              {/* - Evento - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Evento</label>

                <ul className="flex flex-col max-h-40 overflow-y-auto bg-[#0A0A0A] border border-[#333] rounded-lg divide-y divide-[#1A1A1A]">
                  {isLoadingEvents && <li className="px-3 py-2.5 text-sm text-white/40">Carregando eventos...</li>}

                  {!isLoadingEvents && happenedEvents.length === 0 && (
                    <li className="px-3 py-2.5 text-sm text-white/40">Nenhum evento disponível para avaliação.</li>
                  )}

                  {happenedEvents.map((event) => {
                    const isSelected = selectedEventId === event.id;

                    return (
                      <li key={event.id}>
                        <button
                          className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                            isSelected ? "bg-[#3D2B0A] text-[#B8860B] font-semibold" : "text-white/70 hover:bg-[#1A1A1A] hover:text-white"
                          }`}
                          type="button"
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <span className="truncate">{event.title}</span>

                          {isSelected && <span className="h-2 w-2 rounded-full bg-[#B8860B] shrink-0 ml-3" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* - Nota - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Nota</label>

                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;

                    return (
                      <motion.button
                        className="flex justify-center items-center cursor-pointer"
                        type="button"
                        key={starValue}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHoveredRating(starValue)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(starValue)}
                      >
                        <Star
                          className={`h-8 w-8 fill-current transition-colors ${starValue <= (hoveredRating || rating) ? "text-[#B8860B]" : "text-gray-600"}`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* - Comentário - */}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#B8860B] uppercase tracking-wide font-semibold mb-1.5">Comentário</label>

                <textarea
                  className="bg-[#0A0A0A] border border-[#333] focus:border-[#B8860B] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors"
                  rows={3}
                  placeholder="Conte como foi a sua experiência (opcional)"
                  value={comment}
                  onChange={(e) => setComment(masks.eventDescription(e.target.value))}
                />

                <span className="text-xs text-white/40 text-right">{comment.length}/150</span>
              </div>
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-20 w-full px-5">
              {reviewEventError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {reviewEventError}
                </p>
              )}

              {reviewRatingError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {reviewRatingError}
                </p>
              )}

              {reviewSubmitError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {reviewSubmitError}
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
                  handleResetForm();
                  onClose();
                }}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-[#B8860B] font-semibold bg-[#3D2B0A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const success = await handleCreateReview();

                  if (success) {
                    handleResetForm();
                    onClose();
                  }
                }}
              >
                Enviar Avaliação
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CreateReviewModal };
