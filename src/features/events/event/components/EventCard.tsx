import { motion } from "framer-motion";
import { Calendar, Star, Users } from "lucide-react";
import { formattedDate } from "@/shared";
import { type EventProps } from "../types/event";

interface EventCardProps {
  event: EventProps;
  index: number;
  footer: React.ReactNode;
}

const EventCard = ({ event, index, footer }: EventCardProps) => {
  return (
    <motion.div
      className="group/card relative w-full h-fit md:w-90 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#B8860B] shadow-2xs hover:shadow-md shadow-[#DDAE56] hover:-translate-y-2.5 transition-transform duration-200 cursor-pointer"
      key={index}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* - Imagem - */}

      <img
        className="relative h-[70%] w-full object-cover group-hover/card:scale-110 transition-transform duration-500 overflow-hidden"
        src={event.image}
        alt={event.title}
      />

      {/* - Tag do evento - */}

      <div className="absolute top-4 left-4 px-4 py-2 min-h-fit bg-[#B8860B] border border-black/30 rounded-full">
        <span className="flex items-center justify-center text-xs font-bold text-black tracking-wider">
          {event.tag}
        </span>
      </div>

      {/* - Rating - */}

      <div className="absolute flex bottom-68 right-4 h-fit w-15 px-2 py-1 bg-black/80 rounded-full gap-2">
        <Star className="w-4 h-4 text-[#B8860B] fill-current" />

        <span className="text-white text-xs font-bold">{event.rating}</span>
      </div>

      <div className="flex flex-col p-6">
        <span className="text-xl text-white font-bold p-1">{event.title}</span>

        <span className="text-sm text-[#B8860B] font-bold p-1.5">
          {event.artist}
        </span>

        <div className="flex items-center p-2">
          <Calendar className="w-3 h-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-3 text-[#B8860B]" />

          <span className="text-white/60 text-sm font-semibold">
            {formattedDate(event.starts_at).dayName},{" "}
            {formattedDate(event.starts_at).dayNumber} de{" "}
            {formattedDate(event.starts_at).month} às{" "}
            {formattedDate(event.starts_at).time}
          </span>
        </div>

        <div className="flex items-center border-b border-[#B8860B60] w-full p-2 pb-4">
          <Users className="w-3 h-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-3 text-[#B8860B]" />

          <span className="text-white/60 text-sm font-semibold">
            {event.attendees} pessoas confirmadas
          </span>
        </div>

        {/* - Footer do card - */}

        {footer}
      </div>
    </motion.div>
  );
};

export { EventCard };
