"use client";

import { AttractionProvider } from "@/features/events/event/context/AttractionContext";
import { AttractionsManagementList } from "../components/AttractionsManagementList";
import { CreateAttractionModal } from "../components/CreateAttractionModal";
import { DeleteAttractionModal } from "../components/DeleteAttractionModal";
import { DeleteEventModal } from "../components/DeleteEventModal";
import { EditAttractionModal } from "../components/EditAttractionModal";
import { EventsManagementTable, EventsManagementCard, EventsManagementFilter, CreateEventModal, EditEventModal } from "@/features/admin";
import { FaPlusCircle } from "react-icons/fa";
import { motion } from "motion/react";
import { useAttractionContext } from "@/features/events/event/hooks/useAttractionContext";
import { useEffect, useState } from "react";
import { useEventContext } from "@/features/events";
import { useMobileContext } from "@/shared/hooks/useMobileContext";

const EventsManagementContent = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { filteredEvents, eventBeingEdited, setEventBeingEdited, eventBeingDeleted, setEventBeingDeleted } = useEventContext();
  const { attractionBeingEdited, setAttractionBeingEdited, attractionBeingDeleted, setAttractionBeingDeleted } = useAttractionContext();

  /* - Estado da aba ativa - */

  const [activeTab, setActiveTab] = useState<string>("events");

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Estados dos modais - */

  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState<boolean>(false);
  const [isCreateAttractionModalOpen, setIsCreateAttractionModalOpen] = useState<boolean>(false);

  /* - Definições - */

  const itemsPerPage = 6;

  const navLinks = [
    { id: "events", title: "Eventos" },
    { id: "attractions", title: "Atrações" },
  ];

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
          {/* - Área de gestão dos eventos - */}

          {activeTab === "events" && (
            <>
              <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
                {/* - Título - */}

                <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
                  <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
                    Gestão dos Eventos
                  </span>

                  {/* - Subtítulo - */}

                  <span className="text-white/60">Acompanhe a agenda e mantenha o calendário sempre atualizado</span>
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

              {/* - Abas - */}

              <ul className="flex justify-center gap-4 sm:gap-6">
                {navLinks.map((link) => (
                  <motion.li
                    className={`my-auto font-semibold cursor-pointer ${
                      activeTab === link.id
                        ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 underline"
                        : "text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline"
                    }`}
                    key={link.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(link.id)}
                  >
                    {link.title}
                  </motion.li>
                ))}
              </ul>

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
            </>
          )}

          {/* - Área de gestão das atrações - */}

          {activeTab === "attractions" && (
            <>
              <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
                {/* - Título - */}

                <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
                  <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
                    Gestão de Atrações
                  </span>

                  {/* - Subtítulo - */}

                  <span className="text-white/60">Cadastre as atrações que serão associadas aos eventos</span>
                </div>

                {/* - Botão de adicionar atração - */}

                <motion.button
                  className={`flex justify-center items-center bg-[#B8860B] hover:bg-[#7A5A08] shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer ${
                    isPortraitMobile ? "w-full h-12" : isLandscapeMobile ? "w-fit h-15" : "w-auto h-fit"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateAttractionModalOpen(true)}
                >
                  <FaPlusCircle className="mr-2" />
                  Nova Atração
                </motion.button>
              </div>

              {/* - Abas - */}

              <ul className="flex justify-center gap-4 sm:gap-6">
                {navLinks.map((link) => (
                  <motion.li
                    className={`my-auto font-semibold cursor-pointer ${
                      activeTab === link.id
                        ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 underline"
                        : "text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline"
                    }`}
                    key={link.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(link.id)}
                  >
                    {link.title}
                  </motion.li>
                ))}
              </ul>

              {/* - Lista de atrações - */}

              <AttractionsManagementList />

              {/* - Modal de criação de atrações - */}

              {isCreateAttractionModalOpen ? (
                <CreateAttractionModal
                  isOpen={isCreateAttractionModalOpen}
                  onClose={() => setIsCreateAttractionModalOpen(false)}
                />
              ) : null}

              {/* - Modal de edição de atrações - */}

              {attractionBeingEdited ? (
                <EditAttractionModal
                  isOpen={!!attractionBeingEdited}
                  onClose={() => setAttractionBeingEdited(null)}
                />
              ) : null}

              {/* - Modal de deleção de atrações - */}

              {attractionBeingDeleted ? (
                <DeleteAttractionModal
                  isOpen={!!attractionBeingDeleted}
                  onClose={() => setAttractionBeingDeleted(null)}
                  attraction={attractionBeingDeleted}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const EventsManagement = () => {
  return (
    <AttractionProvider>
      <EventsManagementContent />
    </AttractionProvider>
  );
};

export { EventsManagement };
