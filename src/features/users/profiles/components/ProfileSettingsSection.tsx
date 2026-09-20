"use client";

import { ImExit } from "react-icons/im";
import { IoNotifications } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { motion } from "motion/react";
import { requestPasswordReset } from "@/actions/authentication/requestPasswordReset";
import { RiLockPasswordFill } from "react-icons/ri";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useEffect, useRef, useState } from "react";
import { useProfileContext } from "../hooks/useProfileContext";
import { useRouter } from "next/navigation";

const ProfileSettingsSection = () => {
  /* - Puxando do context - */

  const { user, revokeSessionMutation } = useAuthenticationContext();
  const { deleteProfileMutation } = useProfileContext();

  /* - Estados de notificação - */

  const [notifyFavoriteEvents, setNotifyFavoriteEvents] = useState<boolean>(false);
  const [notifyByEmail, setNotifyByEmail] = useState<boolean>(false);
  const [notifyPromotions, setNotifyPromotions] = useState<boolean>(false);

  /* - Estados de modal - */

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  /* - Estados de Erro - */

  const [deleteAccountError, setDeleteAccountError] = useState<string>("");

  /* - Definições - */

  const router = useRouter();
  const deleteAccountRef = useRef<HTMLDivElement | null>(null);

  /* - Funções - */

  // 1. Faz o scroll da página voltar para o topo no momento da renderização

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Redireciona o usuário para a página de recuperação de senha

  const handleChangePassword = async () => {
    if (!user) {
      return;
    }

    const result = await requestPasswordReset(user.email);

    if (!result) {
      return;
    }

    router.replace("/recuperar-senha");
  };

  // 3. Desconecta o usuário do aplicativo e redireciona para a home

  const handleSignOut = async () => {
    const result = await revokeSessionMutation();

    if (!result) {
      return;
    }

    router.replace("/");
  };

  // 4. Redireciona o usuário para o modal de deletar a conta

  const handleDeleteAccount = async () => {
    setDeleteAccountError("");

    const result = await deleteProfileMutation();

    if (!result) {
      setDeleteAccountError("Não foi possível deletar a conta. Tente novamente.");
      return;
    }

    router.replace("/");
  };

  // 5. Fecha os erros ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInsideDeleteAccountRef = !deleteAccountRef.current || deleteAccountRef.current.contains(e.target as Node);

      if (clickedInsideDeleteAccountRef) {
        return;
      }

      setDeleteAccountError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen max-w-full pt-32 px-4 sm:px-6 md:px-0">
      {/* - Título principal - */}

      <div className="flex justify-center items-center h-fit w-full">
        <span className="relative text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-4">Configurações</span>
      </div>

      {/* - Card principal - */}

      <div className="flex flex-col w-full md:w-[65%] h-fit mx-auto mb-2 sm:mt-8 md:mt-4.5 bg-black border border-[#B8860B] rounded-lg">
        {/* - Seção 1: Minha conta - */}

        <div className="flex flex-col p-6 gap-4 border-b border-[#B8860B60]">
          <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-1">Minha Conta</span>

          {/* - Alterar senha - */}

          <div className="flex items-center gap-3">
            <RiLockPasswordFill className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Alterar Senha</span>

            <motion.button
              className="px-4 py-2 whitespace-nowrap sm:w-40 md:w-40 text-sm sm:text-base md:text-base font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-xs shadow-[#B8860B]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChangePassword}
            >
              Alterar Senha
            </motion.button>
          </div>

          {/* - Desconectar - */}

          <div className="flex items-center gap-3">
            <ImExit className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Desconectar</span>

            <motion.button
              className="px-4 py-2 whitespace-nowrap sm:w-40 md:w-40 text-sm sm:text-base md:text-base font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-xs shadow-[#B8860B]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
            >
              Desconectar
            </motion.button>
          </div>
        </div>

        {/* - Seção 2: Notificações - */}

        <div className="flex flex-col p-6 gap-4 border-b border-[#B8860B60]">
          <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-1">Notificações</span>

          {/* - Notificar eventos favoritos - */}

          <div className="flex items-center gap-3">
            <IoNotifications className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Eventos Favoritos</span>

            <div
              className={`relative w-15 h-7 rounded-full transition-colors duration-300 cursor-pointer ${notifyFavoriteEvents ? "bg-[#B8860B]" : "bg-[#333]"}`}
              onClick={() => setNotifyFavoriteEvents(!notifyFavoriteEvents)}
              aria-label="Alternar notificações de eventos favoritos"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300  ${
                  notifyFavoriteEvents ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* - Notificar promoções - */}

          <div className="flex items-center gap-3">
            <IoNotifications className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Promoções</span>

            <div
              className={`relative w-15 h-7 rounded-full transition-colors duration-300 cursor-pointer ${notifyPromotions ? "bg-[#B8860B]" : "bg-[#333]"}`}
              onClick={() => setNotifyPromotions(!notifyPromotions)}
              aria-label="Alternar notificações de promoções"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  notifyPromotions ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* - Notificar por email - */}

          <div className="flex items-center gap-3">
            <IoNotifications className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Notificações por Email</span>

            <div
              className={`relative w-15 h-7 rounded-full transition-colors duration-300 cursor-pointer ${notifyByEmail ? "bg-[#B8860B]" : "bg-[#333]"}`}
              onClick={() => setNotifyByEmail(!notifyByEmail)}
              aria-label="Alternar notificações de promoções"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  notifyByEmail ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>

        {/* - Seção 3: Zona de perigo - */}

        <div className="flex flex-col p-6 gap-4 border-b border-[#B8860B60]">
          <span className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-1">Zona de Perigo</span>

          {/* - Excluir conta - */}

          <div className="flex items-center gap-3">
            <MdDeleteForever className="h-5 w-5 text-[#B8860B]" />

            <span className="text-white/60 font-semibold text-sm sm:text-base md:text-base mr-auto">Excluir Conta</span>

            {/* - Seção de erro - */}

            <motion.button
              className="px-4 py-2 whitespace-nowrap sm:w-40 md:w-40 text-sm sm:text-base md:text-base font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-xs shadow-[#B8860B]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Excluir Conta
            </motion.button>
          </div>

          <span className="text-red-500 text-sm">Essa ação é permanente e não pode ser desfeita!</span>
        </div>
      </div>

      {/* - Modal de confirmação de exclusão - */}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            className="flex flex-col bg-black border border-[#B8860B] rounded-lg p-6 w-fit sm:w-100 gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="text-white font-bold text-xl">Confirmar Exclusão</span>

            <p className="text-white/60 text-sm">
              Tem certeza que deseja excluir sua conta? Todos os seus dados, ingressos e informações serão permanentemente removidos.
            </p>

            {/* - Seção de Erro - */}

            <div
              className="min-h-20 w-full pt-5"
              ref={deleteAccountRef}
            >
              {deleteAccountError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {deleteAccountError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-3 w-[35%] ml-auto">
              <motion.button
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] border border-[#B8860B] rounded-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </motion.button>

              <motion.button
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500/20 border border-red-500 rounded-lg cursor-pointer hover:bg-red-500/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteAccount}
              >
                Excluir Conta
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export { ProfileSettingsSection };
