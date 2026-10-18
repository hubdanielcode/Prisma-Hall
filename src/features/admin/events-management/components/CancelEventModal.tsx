"use client";

import { AnimatePresence, motion } from "motion/react";
import { EventProps, useEventContext } from "@/features/events";
import { masks } from "@/shared/utils";
import { useMobileContext } from "@/shared/hooks";
import { useState } from "react";
import { X } from "lucide-react";

interface CancelEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventProps;
}

const CancelEventModal = ({ isOpen, onClose, event }: CancelEventModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { cancelEventMutation, setEventBeingCancelled } = useEventContext();

  /* - Definições - */

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [wasCancelled, setWasCancelled] = useState(false);

  /* - Evento já cancelado (ou cancelado agora, mas com reembolsos pendentes): o modal só reprocessa os reembolsos - */

  const isRetryMode = event.status === "cancelled" || wasCancelled;
  const isEventActive = event.status === "soon" && !wasCancelled;

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    setIsCancelling(true);
    setErrorMessage(null);

    try {
      const result = await cancelEventMutation(event.id);

      if (!result) {
        setErrorMessage(
          isRetryMode ? "Não foi possível reprocessar os reembolsos. Tente novamente." : "Não foi possível cancelar o evento. Tente novamente.",
        );
        return;
      }

      /* - A partir daqui o evento está cancelado: um novo clique só reprocessa os reembolsos - */

      setWasCancelled(true);

      if (result.pendingRefunds === 0) {
        setEventBeingCancelled(null);
        onClose();
        return;
      }

      if (result.pendingRefunds > 0) {
        setErrorMessage(
          `O evento está cancelado, mas ${result.pendingRefunds} ${
            result.pendingRefunds === 1 ? "pedido ainda não foi reembolsado" : "pedidos ainda não foram reembolsados"
          }. Tente novamente.`,
        );
        return;
      }

      setErrorMessage("O evento está cancelado, mas não foi possível processar os reembolsos. Tente novamente.");
    } catch {
      setErrorMessage("Não foi possível concluir a operação. Tente novamente.");
    } finally {
      setIsCancelling(false);
    }
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
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>
                {isRetryMode ? "Reprocessar Reembolsos" : "Cancelar Evento"}
              </span>

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
              <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base pt-3 pb-6 text-center">
                {isRetryMode
                  ? "Este evento já está cancelado. Deseja tentar reembolsar os pedidos que ficaram pendentes?"
                  : "Tem certeza que deseja cancelar este evento?"}
              </span>

              {/* - Evento que vai ser cancelado - */}

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
                          isEventActive
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />

                      <span className="text-white text-xs font-semibold">{masks.eventStatus(wasCancelled ? "cancelled" : event.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-red-600/80 font-semibold text-sm sm:text-base md:text-base pt-6 pb-3 text-center">
                {isRetryMode
                  ? "Só os pedidos que ainda estão sem reembolso serão processados."
                  : "Quem favoritou o evento será avisado. Essa ação não pode ser desfeita."}
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
                Voltar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-white hover:text-[#FF9595] font-semibold bg-[#440606] border border-[#DF1212] rounded-lg cursor-pointer hover:shadow-sm shadow-[#FF9595] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isCancelling}
                onClick={handleConfirm}
              >
                {isCancelling ? "Processando..." : isRetryMode ? "Tentar Reembolsos" : "Cancelar Evento"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CancelEventModal };
