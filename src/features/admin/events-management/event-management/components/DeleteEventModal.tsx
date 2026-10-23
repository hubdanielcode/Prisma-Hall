"use client";

import { AnimatePresence, motion } from "motion/react";
import { masks } from "@/shared/utils/functions/masks";
import { useEventContext } from "@/features/events/event/hooks/useEventContext";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useState } from "react";
import { X } from "lucide-react";
import type { EventProps } from "@/features/events/event/types/event";

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventProps;
}

const errorMessages = {
  "has-dependencies":
    "Este evento tem ingressos, avaliações ou fotos e não pode ser excluído. Se ele ainda não aconteceu, cancele-o para reembolsar os compradores.",
  "not-found": "Este evento não existe mais.",
  unauthorized: "Você não tem permissão para excluir eventos.",
  unknown: "Não foi possível excluir o evento. Tente novamente.",
} as const;

const DeleteEventModal = ({ isOpen, onClose, event }: DeleteEventModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { deleteEventMutation, setEventBeingDeleted } = useEventContext();

  /* - Definições - */

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* - Fundo escuro - */}

          <motion.div
            className="fixed inset-0 bg-black/90 z-40 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* - Card do modal - */}

          <motion.div
            className={`fixed z-50 ${
              isPortraitMobile
                ? "top-5 w-full h-fit max-w-none mx-0"
                : `inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto mx-4 ${isLandscapeMobile ? "max-w-lg" : "max-w-xl"}`
            } bg-black border border-[#B8860B] rounded-lg overflow-hidden max-h-dh overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#B8860B60]">
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Excluir Evento</span>

              <motion.button
                className="flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            <div className="p-3 flex flex-col items-center justify-center">
              <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base pt-3 pb-6">
                Tem certeza que deseja excluir este evento?
              </span>

              {/* - Evento que vai ser excluido - */}

              <div className="flex justify-center items-start w-fit bg-[#0A0A0A] border border-[#B8860B60] rounded-lg p-5">
                <img
                  className="h-18 w-18 object-cover border border-[#B8860B] rounded-lg shrink-0"
                  src={event.image}
                  alt={event.title}
                />

                <div className="flex flex-col pl-3 gap-y-3">
                  <span className="text-white font-bold text-sm leading-tight">{masks.eventTitle(event.title)}</span>

                  <span className="text-white/50 text-xs line-clamp-2 leading-snug">{masks.eventDescription(event.description)}</span>

                  <div className="flex justify-center items-center px-2 py-1 w-fit bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full">
                    <span className="flex justify-center items-center text-xs font-semibold uppercase text-[#B8860B]">{event.tag}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#B8860B] font-bold text-sm shrink-0">
                      <span className="text-sm font-semibold mr-1.5 ml-2">R$</span>

                      {masks.eventPrice(event.price.toFixed(2).replace(".", ","))}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          event.status === "soon"
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />

                      <span className="text-white text-xs font-semibold">{masks.eventStatus(event.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-red-600/80 font-semibold text-sm sm:text-base md:text-base pt-6 pb-3">
                Essa ação é permanente e não pode ser desfeita.
              </span>

              {errorMessage && <span className="text-red-400 font-semibold text-sm text-center px-3 pb-3">{errorMessage}</span>}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-white hover:text-[#FF9595] font-semibold bg-[#440606] border border-[#DF1212] rounded-lg cursor-pointer hover:shadow-sm shadow-[#FF9595] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setErrorMessage(null);

                  try {
                    const result = await deleteEventMutation(event.id);

                    if (!result.success) {
                      setErrorMessage(errorMessages[result.reason]);
                      return;
                    }

                    setEventBeingDeleted(null);
                    onClose();
                  } catch {
                    setErrorMessage(errorMessages.unknown);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? "Excluindo..." : "Excluir Evento"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { DeleteEventModal };
