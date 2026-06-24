import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { EventCard } from "@/features/events";
import { useTickets } from "@/features/users/tickets/hooks/useTickets";
import { type EventProps } from "@/features/events";
import { MdOutlineCancel } from "react-icons/md";
import { IoTicketOutline, IoHelp } from "react-icons/io5";
import { Link } from "react-router-dom";

const ProfileTicketsSection = () => {
  /* - Puxando do context - */

  const { tickets, isLoading } = useTickets();

  /* - Estados de filtro - */

  const [selectedCategory, setSelectedCategory] = useState<string>("Confirmed");

  /* - Definições - */

  const options = [
    { id: "Confirmed", title: "Confirmados" },
    { id: "Pending", title: "Pendentes" },
    { id: "Cancelled", title: "Cancelados" },
    { id: "Happened", title: "Encerrados" },
  ];

  const emptyArrayMessage: Record<string, string> = {
    Confirmed: "Nenhum ingresso confirmado.",
    Pending: "Nenhum ingresso pendente.",
    Cancelled: "Nenhum ingresso cancelado.",
    Happened: "Nenhum ingresso encerrado.",
  };

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Filtra os ingressos com base nas categorias

  const filteredTickets = tickets
    .filter((ticket) => ticket.status === selectedCategory)
    .map((ticket, index) => (
      <EventCard
        key={ticket.ticket_id}
        event={ticket.events as unknown as EventProps}
        index={index}
        footer={
          <div className="flex flex-col w-full items-start justify-center gap-2 pt-4">
            {/* - Ver pedido - */}

            <Link
              className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
              to="/"
            >
              <IoTicketOutline className="group-hover/link:text-yellow-600" />
              <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-yellow-600 group-hover/link:to-yellow-700 group-hover/link:underline">
                Ver Pedido
              </span>
            </Link>

            {/* - Preciso de ajuda - */}

            <Link
              className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
              to="/"
            >
              <IoHelp className="group-hover/link:text-yellow-600" />
              <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-yellow-600 group-hover/link:to-yellow-700 group-hover/link:underline">
                Preciso de Ajuda
              </span>
            </Link>

            {/* - Cancelar pedido - */}

            {(selectedCategory === "Pending" ||
              selectedCategory === "Confirmed") && (
              <Link
                className="flex items-center gap-3 text-sm text-white/60 uppercase pt-3 cursor-pointer group/link"
                to="/"
              >
                <MdOutlineCancel className="group-hover/link:text-yellow-600" />
                <span className="group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-linear-to-br group-hover/link:from-yellow-500 group-hover/link:via-yellow-600 group-hover/link:to-yellow-700 group-hover/link:underline">
                  Cancelar Pedido
                </span>
              </Link>
            )}
          </div>
        }
      />
    ));

  return (
    <div className="flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6">
      {/* - Título - */}

      <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-8 w-full pb-4 sm:p-6">
        <span className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap pb-8">
          Meus Ingressos
        </span>

        {/* - Searchbar - */}

        <div className="flex bg-[#111] border border-[#B8860B] h-12 sm:h-12 w-full sm:w-[60%] md:w-[30%] rounded-lg text-xs sm:text-sm md:text-sm text-white/60 outline-none px-2 mb-3">
          <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none shrink-0" />

          <input
            className="w-full bg-transparent outline-none text-white font-semibold placeholder:text-white/40"
            type="text"
            placeholder="Pesquisar eventos..."
          />
        </div>
      </div>

      {/* - Filtro por status - */}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        {options.map((option) => (
          <motion.button
            className={`px-4 py-2 text-sm sm:text-base md:text-base font-semibold border rounded-lg cursor-pointer ${
              selectedCategory === option.id
                ? "text-black bg-[#B8860B] hover:bg-[#DDAE56] border-black"
                : "text-white bg-black hover:bg-[#333] border-[#B8860B]"
            }`}
            key={option.id}
            onClick={() => setSelectedCategory(option.id)}
          >
            {option.title}
          </motion.button>
        ))}
      </div>

      {/* - Mensagem de carregamento - */}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-full max-w-6xl py-6 gap-3">
          <span className="text-white/60 font-semibold text-lg text-center col-span-full py-5">
            Carregando lista de ingressos...
          </span>
        </div>
      )}

      {/* - Lista de ingressos filtrados com base nas categorias - */}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-full max-w-6xl py-12 gap-3">
          {filteredTickets.length > 0 ? (
            filteredTickets
          ) : (
            <p className="text-white/60 font-semibold text-lg text-center col-span-full py-5">
              {emptyArrayMessage[selectedCategory]}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export { ProfileTicketsSection };
