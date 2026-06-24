import { motion } from "framer-motion";
import { useCalendarContext } from "@/features/events/agenda/hooks/useCalendarContext";
import { monthNames, useEvents, dayNames } from "@/features/events";
import { formattedDate } from "@/shared";

const CalendarGrid = () => {
  /* - Puxando do context - */

  const { selectedYear, selectedMonth, selectedDay, setSelectedDay } =
    useCalendarContext();
  const { events } = useEvents();

  /* - Definições - */

  const currentMonthIndex = monthNames.indexOf(selectedMonth);
  const firstDay = new Date(selectedYear, currentMonthIndex, 1).getDay();
  const totalDays = new Date(selectedYear, currentMonthIndex + 1, 0).getDate();
  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }).map((_, index) => index + 1),
  ];

  /* - Funções - */

  // 1. Cria um conjunto com os dias que têm evento(s) no mês e ano selecionados

  const daysWithEvents = events
    .filter((event) => {
      const { year, month } = formattedDate(event.starts_at);
      return year === selectedYear && month === selectedMonth.toLowerCase();
    })
    .reduce((accumulator, event) => {
      const { dayNumber } = formattedDate(event.starts_at);
      const eventName = event.title;

      const todayEvents = accumulator.get(dayNumber) ?? [];
      accumulator.set(dayNumber, [...todayEvents, eventName]);
      return accumulator;
    }, new Map<number, string[]>());

  return (
    <div className="flex flex-col justify-center items-center w-full pb-8 pt-4">
      {/* - Nomes dos dias da semana - */}

      <motion.div
        className="grid grid-cols-7 w-full max-w-5xl"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.75 }}
      >
        {dayNames.map((day) => (
          <span
            className="text-center text-white/60 text-xs sm:text-sm font-semibold py-2 tracking-widest"
            key={day}
          >
            {day}
          </span>
        ))}
      </motion.div>

      {/* - Dias - */}

      <motion.div
        className="grid grid-cols-7 gap-1 sm:gap-2 w-full max-w-5xl"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.75 }}
      >
        {calendarCells.map((day, index) => (
          <button
            key={index}
            className={`relative w-full h-12 sm:h-16 md:h-20 bg-[#222] rounded-lg flex items-start justify-center p-1 sm:p-2 text-xs sm:text-sm font-semibold ${day && daysWithEvents.has(day) ? "cursor-pointer hover:bg-[#333]" : "cursor-default"} ${selectedDay === day ? "bg-[#B6880B] hover:bg-[#DDAE56] text-black" : "bg-[#0A0A0A] hover:bg-[#333] text-white"}`}
            onClick={() =>
              day && daysWithEvents.has(day) && setSelectedDay(day)
            }
          >
            {day ?? ""}

            {/* - Colocando os nomes dos eventos nos dias - */}

            {day && daysWithEvents.has(day) && (
              <span
                className={`text-xs font-bold truncate w-full text-center mt-auto ${selectedDay === day ? "text-black font-bold" : "text-white font-semibold"}`}
              >
                {daysWithEvents.get(day)?.[0]}
              </span>
            )}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export { CalendarGrid };
