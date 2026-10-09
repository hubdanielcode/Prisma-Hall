"use client";

import { AnimatePresence, motion } from "motion/react";
import { FaUser } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { Menu, ShieldCheck } from "lucide-react";
import { NotificationBell } from "@/features/users/notifications/components/NotificationBell";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMobileContext } from "../../hooks/useMobileContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
}

const AdminHeader = ({ activeTab, setActiveTab }: AdminHeaderProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile } = useMobileContext();
  const { isAuthenticated, isLoading, revokeSessionMutation } = useAuthenticationContext();

  /* - Estados do menu - */

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  /* - Definições - */

  const router = useRouter();
  const navLinks = [
    { title: "Bar", id: "bar" },
    { title: "Eventos", id: "events" },
    { title: "Estatísticas", id: "analytics" },
    { title: "Usuários", id: "users" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-black backdrop-blur-lg border-b border-[#B8860B60]">
        <div className="md:max-w-full md:mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center justify-center w-full">
              {/* - Logo - */}

              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                onClick={() => router.replace("/")}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-linear-to-tr from-yellow-500 via-black/60 to-yellow-700 rounded-lg flex items-center justify-between shadow-xs shadow-black">
                  <Image
                    className="mx-auto"
                    src="/logo/ph-logo.png"
                    alt="PrismaHall Logo"
                    width={50}
                    height={50}
                  />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-md sm:text-xl md:text-xl font-bold text-white whitespace-nowrap ml-1 mr-5">Prisma Hall</h1>

                  <p className="hidden sm:flex md:flex sm:text-xs md:text-xs bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 font-semibold ml-2 mb-1">
                    LIVE EXPERIENCE
                  </p>
                </div>
              </motion.div>

              {/* - Links - */}

              <div>
                <ul className="hidden md:flex px-6 gap-6">
                  {navLinks.map((link, index) => (
                    <motion.li
                      className={`my-auto font-semibold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer ${
                        link.id === activeTab
                          ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 underline"
                          : "text-white"
                      }`}
                      key={index}
                      onClick={() => setActiveTab(link.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.title}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* - Notificações e início - */}

            {isAuthenticated && (
              <div className="flex items-center justify-center gap-3 mr-3 sm:mr-0 md:mr-0">
                {/* - Notificações - */}

                <NotificationBell />

                {/* - Ir para o início - */}

                <motion.button
                  className="relative group border bg-[#0A0A0A] hover:bg-[#1A1A1A] border-[#B8860B] rounded-full p-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/")}
                  aria-label="Ir para o início"
                >
                  <ShieldCheck className="h-6 w-6 text-[#B8860B] group-hover:text-[#DDAE56]" />
                </motion.button>
              </div>
            )}

            {/* - Menu - */}

            <div className="sm:hidden md:hidden flex items-center">
              <Menu
                className="h-8 w-8 text-white cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>

            {/* - Botões - */}

            <div
              className={`hidden sm:flex md:flex items-center gap-3 ${
                isAuthenticated ? "sm:ml-3 sm:pl-3 sm:border-l sm:border-[#B8860B] md:ml-3 md:pl-3 md:border-l md:border-[#B8860B]" : ""
              }`}
            >
              {isLoading ? (
                <div className="w-24 h-10 rounded-lg bg-[#1A1A1A] animate-pulse" />
              ) : (
                <>
                  {/* - Perfil (desktop) - */}

                  {isAuthenticated && (
                    <motion.button
                      className="flex justify-center items-center w-fit bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] hover:border-[#B8860B] text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/perfil")}
                    >
                      <FaUser className="mr-2 h-4 w-4" />
                      Perfil
                    </motion.button>
                  )}

                  {/* - Sair/Entrar (desktop) - */}

                  <motion.button
                    className="flex justify-center items-center w-fit h-fit bg-[#B8860B] hover:bg-[#7A5A08] shadow-sm shadow-[#B8860B] hover:shadow-[#7A5A08] text-black text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isAuthenticated) {
                        revokeSessionMutation();
                      } else {
                        router.replace("/login");
                      }
                    }}
                  >
                    <ImExit className="mr-2 h-4 w-4" />

                    {isAuthenticated ? "Sair" : "Entrar"}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isPortraitMobile && isMobileMenuOpen && (
          <motion.div
            className="fixed top-20 sm:top-22 right-0 left-auto w-40 flex flex-col bg-black/80 backdrop-blur-lg border rounded-lg border-[#B8860B] z-40"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className="px-6 py-4 text-white font-semibold border-b border-[#B8870B60] last:border-none cursor-pointer"
                  role="button"
                  onClick={() => setActiveTab(link.id)}
                >
                  {link.title}
                </li>
              ))}

              <li className="px-6 py-4">
                {isLoading ? (
                  <div className="w-20 h-6 rounded-md bg-[#1A1A1A] animate-pulse" />
                ) : (
                  <motion.button
                    className="flex justify-center items-center text-white font-semibold cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isAuthenticated) {
                        revokeSessionMutation();
                      } else {
                        router.replace("/login");
                      }
                    }}
                  >
                    <ImExit className="mr-2 h-4 w-4" />
                    {isAuthenticated ? "Sair" : "Entrar"}
                  </motion.button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AdminHeader };
