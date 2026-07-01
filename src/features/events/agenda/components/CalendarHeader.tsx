import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthNames, useCalendarContext, useEvents } from "@/features/events";
import { formattedDate } from "@/shared";

const CalendarHeader = () => {
  /* - Puxando do context - */

  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } =
    useCalendarContext();

  const { events } = useEvents();

  /* - Definições - */

  const currentMonthIndex = monthNames.indexOf(selectedMonth);

  const monthEvents = new Set(
    events
      .filter((event) => {
        const { month, year } = formattedDate(event.starts_at);
        return month === selectedMonth.toLowerCase() && year === selectedYear;
      })
      .map((event) => formattedDate(event.starts_at)),
  );

  /* - Funções - */

  // 1. Passa para o próximo mês e mostra os eventos daquele mês

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setSelectedMonth(monthNames[0]);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(monthNames[currentMonthIndex + 1]);
    }
  };

  // 2. Volta para o mês anterior e mostra os eventos daquele mês

  const handlePreviousMonth = () => {
    const currentMonthIndex = monthNames.indexOf(selectedMonth);

    if (currentMonthIndex === 0) {
      setSelectedMonth(monthNames[11]);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(monthNames[currentMonthIndex - 1]);
    }
  };

  return (
    <motion.div
      className="flex justify-around items-center w-full max-w-6xl pt-8 pb-4 bg-[#0A0A0A] rounded-t-lg border-b border-[#B8860B]"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.75 }}
    >
      {/* - Botão de mês anterior - */}

      <motion.button
        className="text-[#B8860B] cursor-pointer bg-[#0A0A0A80]"
        onClick={handlePreviousMonth}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="h-8 w-8 p-1" />
      </motion.button>

      {/* - Título - */}

      <div className="flex items-center flex-col">
        <motion.span className="text-white font-bold text-lg">
          {selectedMonth} {selectedYear}
        </motion.span>

        <motion.span className="text-[#B8860B] text-sm">
          {monthEvents.size} eventos este mês
        </motion.span>
      </div>

      {/* - Botão de próximo mês - */}

      <motion.button
        className="text-[#B8860B] cursor-pointer bg-[#0A0A0A80]"
        onClick={handleNextMonth}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight className="h-8 w-8 p-1" />
      </motion.button>
    </motion.div>
  );
};

export { CalendarHeader };
