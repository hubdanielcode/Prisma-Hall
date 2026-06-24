import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, List } from "lucide-react";
import {
  CalendarGrid,
  CalendarHeader,
  useCalendarContext,
} from "@/features/events/agenda";
import {
  EventListItem,
  EventModal,
  eventTags,
  useEvents,
  type EventProps,
} from "@/features/events/event";
import { formattedDate } from "@/shared";

const Schedule = () => {
  /* - Puxando do context - */

  const { selectedYear, selectedMonth, selectedDay } = useCalendarContext();
  const { events } = useEvents();

  /* - Estados de vizualizaçao - */

  const [viewState, setViewState] = useState<"Calendar" | "List">("Calendar");

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  /* - Estado do evento selecionado no modal - */

  const [selectedEvent, setSelectedEvent] = useState<EventProps | null>(null);

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Filtra os eventos com base no dia exato (DD/MMMM/AA)

  const filteredEvents = events.filter((event) => {
    const { dayNumber, month, year } = formattedDate(event.starts_at);
    return (
      dayNumber === selectedDay &&
      month === selectedMonth.toLowerCase() &&
      year === selectedYear
    );
  });

  // 3. Mostra os eventos do dia selecionado

  const todayEvents = filteredEvents.filter((event) => {
    const { dayNumber, month, year } = formattedDate(event.starts_at);
    return (
      dayNumber === selectedDay &&
      month === selectedMonth.toLowerCase() &&
      year === selectedYear
    );
  });

  // 4. Mostra os eventos do mês selecionado na visão de lista, filtrados por categoria

  const monthEvents = events
    .filter((event) => {
      const { month, year } = formattedDate(event.starts_at);
      const matchDate =
        month === selectedMonth.toLowerCase() && year === selectedYear;
      const matchCategory =
        selectedCategory === "all" || selectedCategory === event.tag;
      return matchDate && matchCategory;
    })
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#1A1A1A] pt-20 lg:pt-26 gap-4 px-4 sm:px-6 lg:px-8 py-8">
      {/* - Título - */}

      <motion.span
        className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white text-center"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Agenda Completa
      </motion.span>

      {/* - Descrição - */}

      <motion.span
        className="text-white/60 text-center text-sm sm:text-base md:text-lg"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Veja todos os eventos e garanta seu ingresso com antecedência.
      </motion.span>

      {/* - Botões de visualização - */}

      <motion.div
        className="flex items-center gap-4"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
      >
        {/* - Botão de mostrar como calendário - */}

        <motion.button
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg w-full h-fit mt-2 text-sm sm:text-base font-semibold transition-colors cursor-pointer ${viewState === "Calendar" ? "bg-[#B8860B] border-[#B8860B] text-black" : "bg-black border-[#B8860B] text-white hover:bg-[#333]"}`}
          onClick={() => {
            setViewState("Calendar");
            setSelectedCategory("all");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar className="h-4 w-4" />
          Calendário
        </motion.button>

        {/* - Botão de mostrar como lista - */}

        <motion.button
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg w-full h-fit mt-2 text-sm sm:text-base font-semibold transition-colors cursor-pointer ${viewState === "List" ? "bg-[#B8860B] border-[#B8860B] text-black" : "bg-black border-[#B8860B] text-white hover:bg-[#333]"}`}
          onClick={() => setViewState("List")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <List className="h-4 w-4" />
          Lista
        </motion.button>
      </motion.div>

      {/* - Filtro de categorias (apenas na visão de lista) - */}

      {viewState === "List" && (
        <motion.div
          className="flex flex-wrap gap-2 sm:gap-3 justify-center pb-2 w-full max-w-5xl"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {eventTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedCategory(tag.id)}
              className={`flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 mt-2 border rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${selectedCategory === tag.id ? "bg-[#B6880B] border-black text-black" : "bg-black border-[#B6880B] text-white hover:bg-[#333]"}`}
            >
              {tag.title}
            </button>
          ))}
        </motion.div>
      )}

      {/* - Visão de calendário - */}

      {viewState === "Calendar" && (
        <>
          <motion.div
            className="border border-[#B6880B] bg-black rounded-lg w-[60%]"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.75 }}
          >
            <CalendarHeader />
            <CalendarGrid />
          </motion.div>

          {/* - Eventos do dia selecionado - */}

          {todayEvents.length > 0 ? (
            <div className="flex flex-col w-full max-w-5xl gap-2">
              {todayEvents.map((event, index) => (
                <EventListItem
                  key={index}
                  event={event}
                  onSelect={setSelectedEvent}
                />
              ))}
            </div>
          ) : (
            <span className="text-white/40 text-sm">
              Nenhum evento neste dia.
            </span>
          )}
        </>
      )}

      {/* - Visão de lista - */}

      {viewState === "List" && (
        <div className="flex flex-col w-full max-w-5xl gap-2">
          {monthEvents.length > 0 ? (
            monthEvents.map((event, index) => (
              <EventListItem
                key={index}
                event={event}
                onSelect={setSelectedEvent}
              />
            ))
          ) : (
            <span className="text-white/40 text-sm text-center">
              Nenhum evento neste mês.
            </span>
          )}
        </div>
      )}

      {/* - Modal do evento selecionado - */}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export { Schedule };
