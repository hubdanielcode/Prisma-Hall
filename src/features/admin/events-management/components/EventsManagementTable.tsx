"use client";

import { useEventContext } from "@/features/events";
import { useMobileContext } from "@/shared/hooks";
import { masks } from "@/shared/utils";
import { motion } from "motion/react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { EventsTablePagination } from "./EventsTablePagination";

interface EventsManagementTableProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const EventsManagementTable = ({ currentPage, onPageChange }: EventsManagementTableProps) => {
  /* - Puxando do context - */

  const { filteredEvents, setEventBeingEdited, setEventBeingDeleted } = useEventContext();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startingIndex, endingIndex);

  /* - Visão mobile portrait: cards - */

  if (isPortraitMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* - Lista de eventos em cards - */}

        <div className="flex flex-col gap-3 text-white">
          {paginatedEvents.map((event) => {
            return (
              <motion.div
                key={event.id}
                className="flex flex-col gap-3 p-3 bg-black border border-[#B8860B] rounded-lg"
              >
                {/* - Eventos - */}

                <div className="flex gap-3">
                  <img
                    className="h-18 w-18 object-cover border border-[#B8860B] rounded-lg shrink-0"
                    src={event.image}
                    alt={event.title}
                  />

                  <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-white font-bold text-sm leading-tight">{masks.eventTitle(event.title)}</span>

                      {/* - Preço - */}

                      <span className="text-[#B8860B] font-bold text-sm shrink-0">
                        <span className="text-xs font-semibold mr-0.5">R$</span>
                        {masks.eventPrice(event.price.toFixed(2).replace(".", ","))}
                      </span>
                    </div>

                    <span className="text-white/50 text-xs line-clamp-2 leading-snug">{masks.eventDescription(event.description)}</span>

                    {/* - Categoria e data do evento - */}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex justify-center items-center px-2 py-1 w-fit bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full mt-3">
                        <span className="flex justify-center items-center whitespace-nowrap text-xs font-semibold uppercase text-[#B8860B]">
                          {masks.eventTag(event.tag)}
                        </span>
                      </div>

                      <span className="text-white/60 text-xs font-semibold shrink-0">{new Date(event.startsAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>

                {/* - Status, criado em e ações - */}

                <div className="flex items-center justify-between pt-2 border-t border-[#B8860B30]">
                  <div className="flex flex-col gap-1">
                    {/* - Status - */}

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          event.status === "happened"
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span className="text-white text-xs font-semibold">{masks.eventStatus(event.status)}</span>
                    </div>

                    {/* - Criado em - */}

                    <span className="text-[#B8860B] font-semibold text-xs">{new Date(event.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>

                  {/* - Ações - */}

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEventBeingEdited(event)}
                    >
                      <FaPencilAlt className="group-hover:text-blue-400 text-xs" />
                    </motion.button>

                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEventBeingDeleted(event)}
                    >
                      <FaTrashAlt className="group-hover:text-red-400 text-xs" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* - Paginação - */}

        <EventsTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* - Container geral - */}

      <div className="w-full border border-[#B8860B] rounded-lg overflow-x-auto">
        <motion.table className="w-full min-w-270 table-fixed">
          <colgroup>
            <col className="w-[27%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
          </colgroup>

          {/* - Cabeçalho da tabela - */}

          <thead className={`bg-[#0A0A0A] text-[#B8860B] tracking-wider uppercase ${isLandscapeMobile ? "text-xs" : "text-sm"}`}>
            <tr className={`border-b border-[#B6880660] ${isLandscapeMobile ? "h-16" : "h-20"}`}>
              <th className={`text-center rounded-tl-lg ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Eventos</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Categoria</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Preço</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Status</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Criado Em</th>

              <th className={`text-center ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Ações</th>

              <th className={`text-center rounded-tr-lg ${isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"}`}>Data do evento</th>
            </tr>
          </thead>

          {/* - Corpo da tabela - */}

          <tbody className="bg-black text-white tracking-wider">
            {paginatedEvents.map((event, index) => {
              const isLast = index === paginatedEvents.length - 1;

              return (
                <tr
                  className="border-b border-[#333]"
                  key={event.id}
                >
                  {/* - Eventos - */}

                  <td className={`${isLast ? "rounded-bl-lg" : ""}`}>
                    <div className={`flex gap-1 ${isLandscapeMobile ? "p-2" : "p-3"}`}>
                      <img
                        className={`object-cover border border-[#B8860B] rounded-lg shrink-0 ${isLandscapeMobile ? "h-12 w-12 mx-2" : "h-16 w-16 mx-4"}`}
                        src={event.image}
                        alt={event.title}
                      />

                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm leading-tight">{masks.eventTitle(event.title)}</span>

                        <span className="text-white/60 text-xs leading-tight line-clamp-3">{masks.eventDescription(event.description)}</span>
                      </div>
                    </div>
                  </td>

                  {/* - Categoria - */}

                  <td>
                    <div
                      className={`flex items-center justify-center mx-auto bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full ${
                        isLandscapeMobile ? "w-24" : "w-30"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center whitespace-nowrap text-[#B8860B] font-semibold uppercase ${
                          isLandscapeMobile ? "px-1 py-1.5 text-[10px]" : "px-2 py-2 text-xs"
                        }`}
                      >
                        {masks.eventTag(event.tag)}
                      </span>
                    </div>
                  </td>

                  {/* - Preço - */}

                  <td className="text-center text-[#B8860B]">
                    <span className={`font-bold ${isLandscapeMobile ? "pl-2 pr-1" : "pl-4 pr-1"}`}>R$</span>

                    <span className="font-semibold">{masks.eventPrice(event.price.toFixed(2).replace(".", ","))}</span>
                  </td>

                  {/* - Status - */}

                  <td>
                    <div className="flex justify-center items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          event.status === "happened"
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span>{masks.eventStatus(event.status)}</span>
                    </div>
                  </td>

                  {/* - Criado em - */}

                  <td className="text-center font-semibold">
                    <span className={`text-[#B8860B] ${isLandscapeMobile ? "pl-2" : "pl-4"}`}>
                      {new Date(event.createdAt).toLocaleDateString("pt-BR")}{" "}
                    </span>
                  </td>

                  {/* - Ações - */}

                  <td className="text-center">
                    <div className={`flex justify-center ${isLandscapeMobile ? "gap-4" : "gap-8"}`}>
                      {/* - Botão de editar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEventBeingEdited(event)}
                      >
                        <span>
                          <FaPencilAlt className="group-hover:text-blue-400" />
                        </span>
                      </motion.button>

                      {/* - Botão de deletar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEventBeingDeleted(event)}
                      >
                        <span>
                          <FaTrashAlt className="group-hover:text-red-400" />
                        </span>
                      </motion.button>
                    </div>
                  </td>

                  {/* - Data do evento - */}

                  <td className="text-center font-semibold">{new Date(event.startsAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      {/* - Paginação - */}

      <EventsTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export { EventsManagementTable };
