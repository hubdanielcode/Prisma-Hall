"use client";

import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { masks } from "@/shared/utils";
import { motion } from "motion/react";
import { useAttractionContext } from "@/features/events/event/hooks/useAttractionContext";

const AttractionsManagementList = () => {
  /* - Puxando do context - */

  const { attractions, isLoading, error, setAttractionBeingEdited, setAttractionBeingDeleted } = useAttractionContext();

  /* - Estados de carregamento e erro - */

  if (isLoading) {
    return <span className="text-white/60 font-semibold text-center py-5">Carregando lista de atrações...</span>;
  }

  if (error) {
    return <span className="text-red-500 font-semibold text-center py-5">Erro ao buscar atrações.</span>;
  }

  if (!attractions || attractions.length === 0) {
    return <span className="text-white/40 font-semibold text-center py-5">Nenhuma atração cadastrada.</span>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-4">
      {attractions.map((attraction) => (
        <div
          className="flex flex-col justify-between bg-black border border-[#B8860B60] rounded-lg p-4 gap-4"
          key={attraction.id}
        >
          <div className="flex gap-3">
            {/* - Imagem - */}

            <img
              className="h-16 w-16 object-cover border border-[#B8860B] rounded-lg shrink-0"
              src={attraction.image}
              alt={attraction.name}
            />

            {/* - Informações - */}

            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-sm leading-tight">{masks.eventTitle(attraction.name)}</span>

              {attraction.description && (
                <span className="text-white/60 text-xs leading-tight line-clamp-3 mt-1">{masks.eventDescription(attraction.description)}</span>
              )}
            </div>
          </div>

          {/* - Ações - */}

          <div className="flex items-center justify-between">
            <span className="text-[#B8860B] text-xs font-semibold">{new Date(attraction.createdAt).toLocaleDateString("pt-BR")}</span>

            <div className="flex gap-4">
              {/* - Botão de editar - */}

              <motion.button
                className="group flex justify-center items-center h-10 w-10 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAttractionBeingEdited(attraction)}
              >
                <span className="text-white">
                  <FaPencilAlt className="group-hover:text-blue-400" />
                </span>
              </motion.button>

              {/* - Botão de deletar - */}

              <motion.button
                className="group flex justify-center items-center h-10 w-10 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAttractionBeingDeleted(attraction)}
              >
                <span className="text-white">
                  <FaTrashAlt className="group-hover:text-red-400" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { AttractionsManagementList };
