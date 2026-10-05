"use client";

import { FaUser, FaStar, FaTicketAlt, FaCalendarAlt } from "react-icons/fa";
import { useEvents } from "@/features/events";
import { useMemo } from "react";
import { useMobileContext } from "@/shared/hooks";

const EventsManagementCard = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { events } = useEvents();

  /* - Definições - */

  const eventList = events ?? [];

  // Público total

  const totalAudience = useMemo(() => {
    const pastEvents = eventList.filter((event) => new Date(event.startsAt) <= new Date());

    if (pastEvents.length === 0) {
      return null;
    }

    return pastEvents.reduce((accumulator, event) => accumulator + event.attendees, 0);
  }, [eventList]);

  // Avaliação média

  const averageRating = useMemo(() => {
    const ratedEvents = eventList.filter((event) => event.rating > 0.0 && new Date(event.startsAt) <= new Date());

    if (ratedEvents.length === 0) {
      return null;
    }

    return ratedEvents.reduce((accumulator, event) => accumulator + event.rating, 0.0) / ratedEvents.length;
  }, [eventList]);

  // Datas de referência

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const isInMonth = (date: string, year: number, month: number) => {
    const parsedDate = new Date(date);

    return parsedDate.getFullYear() === year && parsedDate.getMonth() === month;
  };

  // Eventos criados neste mês

  const totalCreatedThisMonth = eventList.filter((event) => isInMonth(event.createdAt, now.getFullYear(), now.getMonth())).length;

  // Eventos dos próximos 7 dias

  const totalUpcoming = eventList.filter((event) => {
    const eventStartDate = new Date(event.startsAt);

    return eventStartDate >= now && eventStartDate <= new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);
  }).length;

  const upcomingMessage = eventList.length === 0 ? "0% do total" : `${Math.round((totalUpcoming / eventList.length) * 100)}% do total`;

  // Variação do público em relação ao mês anterior

  const audienceThisMonth = eventList
    .filter((event) => isInMonth(event.startsAt, now.getFullYear(), now.getMonth()) && new Date(event.startsAt) <= now)
    .reduce((accumulator, event) => accumulator + event.attendees, 0);

  const audienceLastMonth = eventList
    .filter((event) => isInMonth(event.startsAt, previousMonth.getFullYear(), previousMonth.getMonth()))
    .reduce((accumulator, event) => accumulator + event.attendees, 0);

  const audienceChange = audienceLastMonth === 0 ? null : Math.round(((audienceThisMonth - audienceLastMonth) / audienceLastMonth) * 100);
  const audienceMessage = audienceChange === null ? "Sem comparação" : `${audienceChange >= 0 ? "+" : ""}${audienceChange}% este mês`;

  // Eventos que entraram na avaliação média

  const totalRated = eventList.filter((event) => event.rating > 0.0 && new Date(event.startsAt) <= now).length;
  const ratingMessage = totalRated === 0 ? "Sem avaliações" : `${totalRated} ${totalRated === 1 ? "evento avaliado" : "eventos avaliados"}`;

  const cardData = [
    {
      id: "all",
      icon: <FaTicketAlt size={24} />,
      message: `+${totalCreatedThisMonth} este mês`,
      title: "Todos os eventos",
      quantity: eventList.length,
    },

    {
      id: "upcoming_eventss",
      icon: <FaCalendarAlt size={24} />,
      message: upcomingMessage,
      title: "Próximos 7 dias",
      quantity: totalUpcoming,
    },

    {
      id: "total_audience",
      icon: <FaUser size={24} />,
      message: audienceMessage,
      title: "Público Total",
      quantity: totalAudience,
    },

    {
      id: "average_ratting",
      icon: <FaStar size={24} />,
      message: ratingMessage,
      title: "Avaliação média",
      quantity: averageRating?.toFixed(1),
    },
  ];

  return (
    <div
      className={`w-full ${isPortraitMobile ? "grid grid-cols-2 gap-2" : "flex flex-nowrap items-stretch"} ${isLandscapeMobile ? "gap-3" : "gap-4"}`}
    >
      {cardData.map((card) => (
        <div
          className={`bg-black border border-[#B8860B] rounded-lg w-auto ${
            isPortraitMobile ? "col-span-1 h-32 p-1" : isLandscapeMobile ? "flex-1 h-32 p-0.75" : "flex-1 h-36 p-2"
          }`}
          key={card.id}
        >
          <div className="flex flex-col justify-center w-full">
            {/* - Ícone, mensagem e título - */}

            <div className={`flex flex-col text-[#B8860B] ${isPortraitMobile ? "gap-1" : "gap-1.5"}`}>
              <div className="flex justify-between w-full">
                <span className="w-fit border border-[#B8860B] rounded-lg bg-[#3D2B0A] p-1.5 m-2">{card.icon}</span>

                <span className="text-green-400 text-xs font-semibold text-nowrap tracking-widest uppercase mt-4 ml-auto pr-2">{card.message}</span>
              </div>

              <span
                className={`text-white/60 font-semibold text-nowrap tracking-widest uppercase pt-1 pl-2 ${
                  isPortraitMobile ? "text-[11px]" : isLandscapeMobile ? "text-[9px]" : "text-[11px]"
                }`}
              >
                {card.title}
              </span>
            </div>

            {/* - Quantidade - */}

            <span
              className={`flex items-start justify-start text-white font-bold pt-1 pl-2 ${
                isPortraitMobile ? "text-xl" : isLandscapeMobile ? "text-lg" : "text-2xl"
              }`}
            >
              {card.quantity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export { EventsManagementCard };
