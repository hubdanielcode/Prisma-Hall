import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formattedDate } from "@/shared";
import { type EventProps } from "../types/event";

interface EventListItemProps {
  event: EventProps;
  onSelect: (event: EventProps) => void;
}

const EventListItem = ({ event, onSelect }: EventListItemProps) => {
  return (
    <motion.button
      className="flex items-center gap-4 w-full bg-black border border-[#B6880B60] hover:border-[#B6880B] rounded-lg px-5 py-2.5 cursor-pointer transition-colors text-left"
      onClick={() => onSelect(event)}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.75 }}
    >
      {/* - Data - */}

      <div className="flex flex-col items-center justify-center w-25 shrink-0 gap-2">
        <span className="text-[#B6880B] font-bold text-lg leading-none">
          {formattedDate(event.starts_at).dayNumber}
        </span>

        <span className="text-white/40 text-xs uppercase">
          {formattedDate(event.starts_at).dayName}
        </span>
      </div>

      <div className="w-px h-10 bg-[#B6880B30] shrink-0" />

      {/* - Imagem - */}

      <img
        className="w-10 h-10 object-cover rounded-lg shrink-0"
        src={event.image}
        alt={event.title}
      />

      {/* - Título e artista - */}

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-white font-semibold text-sm sm:text-base truncate">
          {event.title}
        </span>
        <span className="text-white/60 text-xs truncate">{event.artist}</span>
      </div>

      {/* - Horário - */}

      <div className="flex items-center text-white/60 text-xs sm:text-sm shrink-0 gap-1">
        <Clock className="h-3.5 w-3.5 text-[#B6880B]" />
        {formattedDate(event.starts_at).time}
      </div>

      {/* - Preço - */}

      <span className="text-[#B6880B] font-bold text-sm sm:text-base shrink-0">
        R$: {event.price.toFixed(2).replace(".", ",")}
      </span>
    </motion.button>
  );
};

export { EventListItem };
