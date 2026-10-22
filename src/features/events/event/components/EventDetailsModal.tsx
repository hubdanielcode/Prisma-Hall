"use client";

import { Clock, Star, Ticket, Users, X } from "lucide-react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { formattedDate } from "@/shared/utils/functions/dates";
import { motion, AnimatePresence } from "motion/react";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useBlockScroll } from "@/shared/hooks/useBlockScroll";
import { useCartContext } from "@/features/cart/hooks/useCartContext";
import { useFavoriteEvents } from "../hooks/useFavoriteEvents";
import { useRouter } from "next/navigation";
import type { EventProps } from "../types/event";

interface EventDetailsModalProps {
  event: EventProps | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  /* - Puxando do context - */

  const { handleAddToCart, setIsCartOpen } = useCartContext();
  const { isAuthenticated } = useAuthenticationContext();
  const { favoriteEventIds, isPending, favoriteEventMutation } = useFavoriteEvents();

  /* - Definições - */

  const router = useRouter();

  const isFavorite = event ? favoriteEventIds.has(event.id) : false;

  /* - Funções - */

  // 1. Impedindo o scroll enquanto o modal estiver aberto

  useBlockScroll(isOpen);

  // 2. Favorita (ou desfavorita) o evento

  const handleToggleFavorite = async () => {
    if (!event) {
      return;
    }

    await favoriteEventMutation(event.id);
  };

  return (
    <AnimatePresence>
      {isOpen && event && (
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
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4 bg-black border border-[#B8860B] rounded-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Botão de fechar - */}

            <button
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center px-4 py-4 gap-3">
              {/* - Foto do evento - */}

              <img
                className="w-20 h-20 object-cover rounded-lg border border-[#B8860B60] shrink-0"
                src={event.image}
                alt={event.title}
              />

              {/* - Informações do evento - */}

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {/* - Título do evento - */}

                <span className="text-white font-semibold text-xl truncate">{event.title}</span>

                {/* - Artista(s) do evento - */}

                <span className="text-[#B8860B] font-semibold text-base truncate">{event.attractionName}</span>

                {/* - Detalhes do evento - */}

                <div className="flex flex-wrap gap-3 mt-0.5">
                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Clock className="h-4 w-4 mr-1 text-[#B8860B] shrink-0" />

                    {formattedDate(event.startsAt).time}
                  </div>

                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Users className="h-4 w-4 mr-1 text-[#B8860B] shrink-0" />

                    {event.attendees}
                  </div>

                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Star className="h-4 w-4 mr-1 text-[#B8860B] fill-current shrink-0" />

                    {event.rating}
                  </div>
                </div>
              </div>

              {/* - Preço - */}

              <span className="text-[#B8860B] font-bold text-2xl shrink-0">R$ {event.price.toFixed(2).replace(".", ",")}</span>
            </div>

            {/* - Botões de favoritar e comprar - */}

            <div className="flex items-center justify-center py-4 gap-3 border-t border-[#B8860B30]">
              {/* - Botão de favoritar (só para usuário logado e eventos que ainda vão acontecer) - */}

              {isAuthenticated && event.status === "soon" && (
                <motion.button
                  className="flex items-center px-5 py-2 text-base text-white font-semibold border border-[#B8860B60] rounded-lg gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPending}
                  onClick={handleToggleFavorite}
                >
                  {isFavorite ? <FaHeart className="text-red-600" /> : <FaRegHeart className="text-red-600" />}
                  {isFavorite ? "Favoritado" : "Favoritar"}
                </motion.button>
              )}

              <motion.button
                className="flex items-center px-5 py-2 text-base text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg gap-2 cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isAuthenticated) {
                    handleAddToCart({
                      eventId: event.id,
                      type: "tickets",
                      quantity: 1,
                    });

                    setIsCartOpen(true);
                  } else {
                    router.replace("/login");
                  }
                }}
              >
                <Ticket className="w-5 h-5" />
                Garantir Ingresso
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { EventDetailsModal };
