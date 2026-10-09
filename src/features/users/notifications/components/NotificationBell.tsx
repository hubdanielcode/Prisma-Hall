"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/features/users/notifications/hooks/useNotifications";

const NotificationBell = () => {
  /* - Puxando do hook - */

  const { notifications, unreadCount, isLoading, error, markSingleNotificationAsReadMutation, markAllNotificationsAsReadMutation } =
    useNotifications();

  /* - Estados do dropdown - */

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  /* - Definições - */

  const notificationBellRef = useRef<HTMLDivElement | null>(null);

  /* - Funções - */

  // 1. Fecha o dropdown ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !notificationBellRef.current || notificationBellRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

      setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Tempo decorrido desde a notificação

  const elapsedTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  // 3. Marca uma notificação como lida ao clicar nela

  const handleReadNotification = async (notificationId: string, isUnread: boolean) => {
    if (!isUnread) {
      return;
    }

    await markSingleNotificationAsReadMutation(notificationId);
  };

  return (
    <div
      className="relative"
      ref={notificationBellRef}
    >
      {/* - Botão do sino - */}

      <motion.button
        className="relative group border bg-[#0A0A0A] hover:bg-[#1A1A1A] border-[#B8860B] rounded-full p-2 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Bell className="h-6 w-6 text-[#B8860B] group-hover:text-[#DDAE56]" />

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center bg-[#B8860B] w-4 h-4 md:w-5 md:h-5 rounded-full border border-black">
            <span className="text-xs text-black font-black">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </div>
        )}
      </motion.button>

      {/* - Dropdown de notificações - */}

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute right-0 top-full mt-3 flex flex-col w-72 sm:w-80 max-h-96 bg-black border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* - Cabeçalho - */}

            <div className="flex items-center justify-between px-4 py-3 border-b border-[#B8860B60]">
              <span className="text-white font-semibold">Notificações</span>

              {unreadCount > 0 && (
                <button
                  className="flex items-center gap-1 text-xs text-white/60 hover:text-[#B8860B] font-semibold cursor-pointer"
                  onClick={() => markAllNotificationsAsReadMutation()}
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* - Lista - */}

            <div className="flex flex-col overflow-y-auto">
              {isLoading && <p className="text-white/60 text-sm text-center p-6">Carregando notificações...</p>}

              {!isLoading && error && <p className="text-red-500 text-sm text-center p-6">Erro ao buscar notificações.</p>}

              {!isLoading && !error && notifications.length === 0 && (
                <p className="text-white/40 text-sm text-center p-6">Nenhuma notificação por aqui.</p>
              )}

              {!isLoading &&
                !error &&
                notifications.map((notification) => {
                  const isUnread = !notification.readAt;

                  return (
                    <div
                      className={`flex flex-col items-start gap-1 px-4 py-3 text-left border-b border-[#B8860B30] last:border-b-0 ${
                        isUnread ? "bg-[#3D2B0A] cursor-pointer" : "bg-black hover:bg-[#0A0A0A]"
                      }`}
                      key={notification.id}
                      onClick={() => handleReadNotification(notification.id, isUnread)}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-white text-sm font-semibold">{notification.title}</span>

                        {isUnread && (
                          <button
                            className="h-2 w-2 rounded-full bg-[#B8860B] hover:bg-[#DDAE56] cursor-pointer shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReadNotification(notification.id, isUnread);
                            }}
                          />
                        )}
                      </div>

                      <span className="text-white/60 text-xs">{notification.message}</span>

                      <span className="text-[#B8860B] text-xs font-semibold">{elapsedTime(notification.createdAt)}</span>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { NotificationBell };
