"use client";

import { AnimatePresence, motion } from "motion/react";
import { roleBadgeLabels, roleBadgeStyles } from "@/features/users/user/utils/roleBadges";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { UserAvatar } from "./UserAvatar";
import { useState } from "react";
import { useUserContext } from "@/features/users/user/hooks/useUserContext";
import { X } from "lucide-react";
import type { UserProps } from "@/features/users";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProps;
}

const DeleteUserModal = ({ isOpen, onClose, user }: DeleteUserModalProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { deleteUserMutation, setUserBeingDeleted } = useUserContext();

  /* - Estados de erro - */

  const [userSubmitError, setUserSubmitError] = useState<string>("");

  /* - Definições - */

  const roleBadge = roleBadgeStyles[user.role];

  /* - Funções - */

  // 1. Exclui o usuário

  const handleDeleteUser = async () => {
    setUserSubmitError("");

    const deletedUser = await deleteUserMutation(user.id);

    if (!deletedUser) {
      setUserSubmitError("Não foi possível excluir o usuário. Você não pode excluir a própria conta por este painel.");
      return;
    }

    setUserBeingDeleted(null);
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
            onClick={onClose}
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
              <span className={`text-white font-semibold leading-none ${isPortraitMobile ? "text-lg" : "text-xl"}`}>Excluir Usuário</span>

              <motion.button
                className="flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                <X className="text-white/60 hover:text-white h-5 w-5 transition-colors" />
              </motion.button>
            </div>

            <div className="p-3 flex flex-col items-center justify-center">
              <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base pt-3 pb-6">
                Tem certeza que deseja excluir este usuário?
              </span>

              {/* - Usuário que vai ser excluído - */}

              <div className="flex justify-center items-start w-fit bg-[#0A0A0A] border border-[#B8860B60] rounded-lg p-5">
                <UserAvatar
                  user={user}
                  className="h-15 w-15"
                />

                <div className="flex flex-col pl-3 gap-y-3">
                  <span className="text-white font-bold text-sm leading-tight">{user.name}</span>

                  <span className="text-white/50 text-xs leading-snug">{user.email}</span>

                  <div
                    className={`flex justify-center items-center px-2 py-1 w-fit backdrop-blur-sm border rounded-full ${roleBadge.background} ${roleBadge.border}`}
                  >
                    <span className={`flex justify-center items-center text-xs font-semibold uppercase ${roleBadge.text}`}>
                      {roleBadgeLabels[user.role]}
                    </span>
                  </div>

                  <span className="text-[#B8860B] font-semibold text-xs">Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="text-red-600/80 font-semibold text-sm sm:text-base md:text-base text-center pt-6 pb-3 space-y-2">
                <p>Essa ação é permanente e não pode ser desfeita.</p>

                <p>Apaga perfil, pedidos, ingressos, vouchers, avaliações e sessões do usuário</p>
              </div>
            </div>

            {/* - Seção de erro - */}

            <div className="min-h-24 w-full px-5">
              {userSubmitError && (
                <p className="flex items-center justify-center rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-3 text-center">
                  {userSubmitError}
                </p>
              )}
            </div>

            {/* - Ações - */}

            <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-[#B8860B60]">
              <motion.button
                className="px-4 py-2 text-sm text-white/60 font-semibold rounded-lg cursor-pointer hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="px-5 py-2 text-sm text-white hover:text-[#FF9595] font-semibold bg-[#440606] border border-[#DF1212] rounded-lg cursor-pointer hover:shadow-sm shadow-[#FF9595] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteUser}
              >
                Excluir Usuário
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { DeleteUserModal };
