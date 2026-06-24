import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Ticket, Users, X } from "lucide-react";
import { formattedDate } from "@/shared";
import type { EventProps } from "@/features/events/event/types/event";
import { useCartContext } from "@/features/cart";
import { useNavigate } from "react-router-dom";
import { useAuthenticationContext } from "@/features/authentication";

interface EventModalProps {
  event: EventProps | null;
  onClose: () => void;
}

const EventModal = ({ event, onClose }: EventModalProps) => {
  /* - Puxando do context - */

  const { handleAddToCart, setIsCartOpen } = useCartContext();
  const { isAuthenticated } = useAuthenticationContext();

  /* - Definições - */

  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {event && (
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
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4 bg-black border border-[#B6880B] rounded-xl overflow-hidden"
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
                className="w-20 h-20 object-cover rounded-lg border border-[#B6880B60] shrink-0"
                src={event.image}
                alt={event.title}
              />

              {/* - Informações do evento - */}

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {/* - Título do evento - */}

                <span className="text-white font-semibold text-xl truncate">
                  {event.title}
                </span>

                {/* - Artista(s) do evento - */}

                <span className="text-[#B6880B] font-semibold text-base truncate">
                  {event.artist}
                </span>

                {/* - Detalhes do evento - */}

                <div className="flex flex-wrap gap-3 mt-0.5">
                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Clock className="h-4 w-4 mr-1 text-[#B6880B] shrink-0" />
                    {formattedDate(event.starts_at).time}
                  </div>

                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Users className="h-4 w-4 mr-1 text-[#B6880B] shrink-0" />
                    {event.attendees}
                  </div>

                  <div className="flex items-center text-white/60 text-sm font-semibold">
                    <Star className="h-4 w-4 mr-1 text-[#B6880B] fill-current shrink-0" />
                    {event.rating}
                  </div>
                </div>
              </div>

              {/* - Preço - */}

              <span className="text-[#B6880B] font-bold text-2xl shrink-0">
                R$ {event.price.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* - Botão de comprar - */}

            <div className="flex justify-center py-4 border-t border-[#B6880B30]">
              <motion.button
                className="flex items-center px-5 py-2 text-base text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg gap-2 cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isAuthenticated) {
                    handleAddToCart({
                      ...event,
                      id: "",
                      type: "tickets",
                      ticket_id: crypto.randomUUID(),
                      event_name: event.title,
                      quantity: 1,
                    });
                    setIsCartOpen(true);
                  } else {
                    navigate("/login", { replace: true });
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

export { EventModal };
