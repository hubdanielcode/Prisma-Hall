import { Quote, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { parsedDate } from "../../../../shared/utils/dates";
import { useReviews } from "../hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { useEvents } from "../..";

const ReviewsSection = () => {
  /* - Puxando os reviews - */

  const { reviews, isLoading, error, averageRating } = useReviews();
  const { events } = useEvents();

  /* - Estados das avaliações - */

  const [showMore, setShowMore] = useState<boolean>(false);

  /* - Definições - */

  const reviewBadges = [
    { label: "Avaliação Média", value: averageRating.toFixed(1), icon: Star },
    { label: "Total de Avaliações", value: `${reviews.length}`, icon: Quote },
    { label: "Eventos Realizados", value: `${events.length}`, icon: Star },
    { label: "Clientes Satisfeitos", value: "98%", icon: Users },
  ];
  return (
    <div
      className="flex flex-col w-full h-fit items-center justify-center bg-[#1A1A1A] border-t border-[#B6880B60] p-12"
      id="about"
    >
      {/* - Tag de avaliações - */}

      <motion.div
        className="inline-block px-4 py-2 mb-10 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">
          Avaliações
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
        O Que Nossos Clientes Dizem
      </motion.span>

      {/* - Descrição - */}

      <motion.span
        className="my-2 text-white/60 text-center text-sm sm:text-base md:text-lg"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Confira os depoimentos de quem já viveu experiências inesquecíveis
        conosco!
      </motion.span>

      {isLoading && !error && (
        <p className="text-white/60 text-center p-12">
          Carregando avaliações...
        </p>
      )}

      {!isLoading && error && (
        <p className="text-red-500 text-center p-12">{error}</p>
      )}

      {/* - Card dos stats - */}

      {!isLoading && !error && (
        <div className="grid grid-cols-2 mx-auto p-6 sm:flex md:flex justify-center gap-4">
          {reviewBadges.map((badge) => {
            const Icon = badge.icon;

            return (
              <div
                className="flex flex-col justify-center items-center w-42 bg-[#0A0A0A] border border-[#B6880B] px-4 py-2 rounded-lg hover:border-[DDAE56] hover:shadow-md hover:shadow-[#DDAE56] whitespace-nowrap"
                key={badge.label}
              >
                <div className="flex justify-center items-center mt-2">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-7 md:w-7 text-[#B6880B] fill-current mr-2" />

                  <span className="text-xl text-white font-bold">
                    {badge.value}
                  </span>
                </div>

                <span className="text-base text-white/60 font-semibold mt-2">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* - Card das avaliações - */}

      {reviews.length === 0 ? (
        <p className="text-white/60 text-center p-12">
          Ainda não há avaliações. Seja o primeiro a avaliar!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 h-fit gap-4">
          {reviews
            .sort(
              (a, b) =>
                parsedDate(b.created_at).getTime() -
                parsedDate(a.created_at).getTime(),
            )
            .slice(0, showMore ? reviews.length : 6)
            .map((review, index) => (
              <ReviewCard
                key={review.review_id}
                review={review}
                index={index}
              />
            ))}
        </div>
      )}

      {/* - Botão de ver todas as avaliações - */}

      <div className="flex justify-center w-full py-10">
        <motion.button
          className="w-fit px-4 py-2 text-white font-semibold bg-black hover:bg-[#111] border border-[#B8860B] rounded-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowMore(!showMore);
            if (showMore) {
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "auto" });
            }
          }}
        >
          <span>{showMore ? "Mostrar Menos" : "Ver Todas as Avaliações"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export { ReviewsSection };
