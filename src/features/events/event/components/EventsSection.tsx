import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { useEvents, EventCard } from "@/features/events";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { useState } from "react";
import { useCartContext } from "@/features/cart";
import { useNavigate } from "react-router-dom";
import { useAuthenticationContext } from "@/features/authentication";

const EventsSection = () => {
  /* - Puxando do context - */

  const { events } = useEvents();
  const { handleAddToCart, isCartOpen, setIsCartOpen } = useCartContext();
  const { isAuthenticated } = useAuthenticationContext();

  /* - Estados de eventos - */

  const [showAll, setShowAll] = useState<boolean>(false);

  /* - Definições - */

  const navigate = useNavigate();

  return (
    <>
      {/* - Carrinho - */}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <div
        className="flex flex-col w-full h-fit items-center justify-center border-t border-[#B6880B60] p-12"
        id="events"
      >
        {/* - Tag de próximos eventos - */}

        <motion.div
          className="inline-block px-4 py-2 mb-10 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
            Próximos Eventos
          </span>
        </motion.div>

        {/* - Título - */}

        <motion.span
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Agenda da Semana
        </motion.span>

        {/* - Descrição - */}

        <motion.span
          className="my-2 text-white/60 text-center text-sm sm:text-base md:text-lg mb-6"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Não perca os melhores eventos da semana. Garanta o seu ingresso agora
          mesmo!
        </motion.span>

        {/* - Cards dos eventos - */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events
            .sort(
              (a, b) =>
                new Date(a.starts_at).getTime() -
                new Date(b.starts_at).getTime(),
            )
            .slice(0, showAll ? events.length : 6)
            .map((event, index) => (
              <EventCard
                key={event.event_id}
                event={event}
                index={index}
                footer={
                  <div className="flex w-full items-center justify-between pt-4">
                    <div className="flex flex-col w-full">
                      <span className="text-white/60 text-sm font-semibold">
                        A partir de
                      </span>

                      <span className="text-xl text-[#B8860B] font-bold">
                        R$ {event.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <motion.button
                      className="flex px-4 py-2 text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg gap-2 cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
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
                      <Ticket className="w-6 h-6" />
                      Comprar
                    </motion.button>
                  </div>
                }
              />
            ))}
        </div>

        {/* - Ver todos os eventos - */}

        <div className="flex justify-center w-full py-10">
          <motion.button
            className="w-fit px-4 py-2 text-white font-semibold bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowAll(!showAll);
              if (showAll) {
                document
                  .getElementById("events")
                  ?.scrollIntoView({ behavior: "auto" });
              }
            }}
          >
            <span>{showAll ? "Mostrar Menos" : "Ver Todos os Eventos"}</span>
          </motion.button>
        </div>
      </div>
    </>
  );
};

export { EventsSection };
