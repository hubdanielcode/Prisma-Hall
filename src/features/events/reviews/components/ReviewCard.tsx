import { motion } from "framer-motion";
import { Quote, Star, Check } from "lucide-react";
import { type ReviewWithDetails } from "../types/reviews";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReviewCardProps {
  review: ReviewWithDetails;
  index: number;
}

const ReviewCard = ({ review, index }: ReviewCardProps) => {
  /* - Definições - */

  const reviewNameMask = (fullName?: string | null) => {
    if (!fullName) {
      return "Usuário PrismaHall";
    }
    return fullName.split(" ").slice(0, 2).join(" ");
  };

  const elapsedTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center w-90 p-6 border border-[#B6880B] hover:border-[#DDAE56] rounded-lg hover:shadow-md hover:shadow-[#DDAE56] bg-[#0A0A0A] hover:-translate-y-2.5 transition-transform duration-200"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Quote className="h-8 w-8 text-[#3D2B0A] fill-[#B6880B]" />

      <div className="flex gap-2 p-6">
        {/* - Nota da avaliação - */}

        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`text-xl ${
              index < Math.floor(review.rating)
                ? "text-[#B6880B] fill-current"
                : "text-gray-600 fill-current"
            }`}
          />
        ))}
      </div>

      {/* - Comentário da avaliação - */}

      <span className="text-sm font-semibold text-white/60">
        {review.comment}
      </span>

      {/* - Nome do evento sendo avaliado - */}

      <span className="text-sm font-semibold text-[#B6880B] pt-3 pb-5 mr-auto border-b border-[#B6880B60] w-full">
        {review.event_name}
      </span>

      {/* - Foto e nome de quem avaliou - */}

      <div className="flex w-full items-center pt-4">
        <img
          className="h-11 w-11 rounded-full"
          src={review.user_photo}
          alt={review.user_name}
        />

        <div className="flex flex-col text-white mt-1">
          <span className="ml-3 text-sm font-semibold">
            {reviewNameMask(review.user_name)}
          </span>

          {/* - Data da avaliação - */}

          <span className="ml-3 mt-1 text-xs font-semibold text-white/60">
            {elapsedTime(review.created_at)}
          </span>
        </div>

        {/* - Badge de verificado - */}

        {review.verified && (
          <div className="flex justify-center items-center h-5 w-5 bg-[#B6880B] mb-4 ml-2 border border-[#3D2B0A] rounded-full">
            <Check className="h-3 w-3 text-black" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { ReviewCard };
