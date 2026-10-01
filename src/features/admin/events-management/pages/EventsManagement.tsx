"use client";

import { DeleteEventModal } from "../components/DeleteEventModal";
import { EventsManagementTable, EventsManagementCard, EventsManagementFilter, CreateEventModal, EditEventModal } from "@/features/admin";
import { FaPlusCircle } from "react-icons/fa";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useEventContext } from "@/features/events";
import { useMobileContext } from "@/shared/hooks/useMobileContext";

const EventsManagement = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { filteredEvents, eventBeingEdited, setEventBeingEdited, eventBeingDeleted, setEventBeingDeleted } = useEventContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Estados dos modais - */

  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState<boolean>(false);

  /* - Definições - */

  const itemsPerPage = 6;

  /* - Funções - */

  // 1. Garantindo que o número de páginas seja recalculado sempre que um item for adicionado ou deletado

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(filteredEvents.length / itemsPerPage), 1);

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredEvents.length]);

  return (
    <>
      <div className={`bg-[#1A1A1A] min-h-screen w-full ${isPortraitMobile ? "pb-10" : isLandscapeMobile ? "pb-12 px-6" : "pb-14 px-8"}`}>
        <div className="flex flex-col max-w-6xl w-full mx-auto gap-6 px-4">
          <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
            {/* - Título - */}

            <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
              <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
                Gestão do Bar
              </span>

              {/* - Subtítulo - */}

              <span className="text-white/60">Acompanhe o estoque e mantenha o cardápio sempre atualizado</span>
            </div>

            {/* - Botão de adicionar evento - */}

            <motion.button
              className={`flex justify-center items-center bg-[#B8860B] hover:bg-[#7A5A08] shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer ${
                isPortraitMobile ? "w-full h-12" : isLandscapeMobile ? "w-fit h-15" : "w-auto h-fit"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateEventModalOpen(true)}
            >
              <FaPlusCircle className="mr-2" />
              Novo Evento
            </motion.button>
          </div>

          {/* - Cards dos eventos - */}

          <div className="flex justify-center">
            <EventsManagementCard />
          </div>

          {/* - Filtro - */}

          <EventsManagementFilter
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Tabela de eventos - */}

          <EventsManagementTable
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Modal de criação de eventos - */}

          {isCreateEventModalOpen ? (
            <CreateEventModal
              isOpen={isCreateEventModalOpen}
              onClose={() => setIsCreateEventModalOpen(false)}
            />
          ) : null}

          {/* - Modal de edição de eventos - */}

          {eventBeingEdited ? (
            <EditEventModal
              isOpen={!!eventBeingEdited}
              onClose={() => setEventBeingEdited(null)}
            />
          ) : null}

          {/* - Modal de deleção de eventos - */}

          {eventBeingDeleted ? (
            <DeleteEventModal
              isOpen={!!eventBeingDeleted}
              onClose={() => setEventBeingDeleted(null)}
              event={eventBeingDeleted}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export { EventsManagement };
