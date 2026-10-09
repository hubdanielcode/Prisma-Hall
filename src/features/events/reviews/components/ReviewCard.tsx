"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { ptBR } from "date-fns/locale";
import { Quote, Star, Check } from "lucide-react";
import { type ReviewWithDetails } from "../types/reviews";

interface ReviewCardProps {
  review: ReviewWithDetails;
  index: number;
}

const ReviewCard = ({ review, index }: ReviewCardProps) => {
  /* - Definições - */

  const reviewNameMask = (name?: string | null) => {
    if (!name) {
      return "Usuário PrismaHall";
    }
    return name.split(" ").slice(0, 2).join(" ");
  };

  const elapsedTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center w-90 p-6 border border-[#B8860B] hover:border-[#DDAE56] rounded-lg hover:shadow-md hover:shadow-[#DDAE56] bg-[#0A0A0A] hover:-translate-y-2.5 transition-transform duration-200"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Quote className="h-8 w-8 text-[#3D2B0A] fill-[#B8860B]" />

      <div className="flex gap-2 p-6">
        {/* - Nota da avaliação - */}

        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`text-xl ${index < Math.floor(review.rating) ? "text-[#B8860B] fill-current" : "text-gray-600 fill-current"}`}
          />
        ))}
      </div>

      {/* - Comentário da avaliação - */}

      <span className="text-sm font-semibold text-white/60">{review.comment}</span>

      {/* - Nome do evento sendo avaliado - */}

      <span className="text-sm font-semibold text-[#B8860B] pt-3 pb-5 mr-auto border-b border-[#B8860B60] w-full">{review.eventName}</span>

      {/* - Foto e nome de quem avaliou - */}

      <div className="flex w-full items-center pt-4">
        {review.userPhoto ? (
          <img
            className="h-11 w-11 object-cover rounded-full"
            src={review.userPhoto}
            alt={review.userName}
          />
        ) : (
          <div className="flex justify-center items-center h-11 w-11 bg-[#3D2B0A] border border-[#B8860B] rounded-full shrink-0">
            <span className="text-[#B8860B] font-bold">{review.userName.trim().charAt(0).toUpperCase()}</span>
          </div>
        )}

        <div className="flex flex-col text-white mt-1">
          <span className="ml-3 text-sm font-semibold">{reviewNameMask(review.userName)}</span>

          {/* - Data da avaliação - */}

          <span className="ml-3 mt-1 text-xs font-semibold text-white/60">{elapsedTime(review.createdAt)}</span>
        </div>

        {/* - Badge de verificado - */}

        {review.verifiedBadge && (
          <div className="flex justify-center items-center h-5 w-5 bg-[#B8860B] mb-4 ml-2 border border-[#3D2B0A] rounded-full">
            <Check className="h-3 w-3 text-black" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { ReviewCard };
