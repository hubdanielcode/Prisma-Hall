"use client";

import { supabase } from "../../../supabase/supabase";
import { AnimatePresence, motion } from "motion/react";
import { FaSearch, FaUser } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { useMobileContext } from "../hooks/UseMobileContext";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuthenticationContext } from "@/features/authentication";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
}

const AdminHeader = ({ activeTab, setActiveTab }: AdminHeaderProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { isAuthenticated } = useAuthenticationContext();

  /* - Estados do dropdown - */

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  /* - Definições - */

  const router = useRouter();

  const navLinks = [
    { title: "Bar", id: "bar" },
    { title: "Eventos", id: "events" },
    { title: "Estatísticas", id: "analytics" },
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
                    width={50}
                    height={50}
                    alt="PrismaHall Logo"
                  />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-md sm:text-xl md:text-xl font-bold text-white whitespace-nowrap ml-1 mr-5">
                    Prisma Hall
                  </h1>

                  <p className="hidden sm:flex md:flex sm:text-xs md:text-xs bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 font-semibold ml-2 mb-1">
                    LIVE EXPERIENCE
                  </p>
                </div>
              </motion.div>

              {/* - Searchbar - */}

              <div className="flex bg-[#111] border border-[#B8860B] w-[50%] sm:w-[50%] md:w-[30%] h-10 rounded-lg text-xs sm:text-sm md:text-sm text-white/60 outline-none px-2">
                <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

                <input
                  className="w-full bg-transparent outline-none text-white font-semibold placeholder:text-white/40"
                  placeholder={`${isPortraitMobile ? "Buscar eventos, bandas..." : "Buscar eventos, bandas, artistas..."}`}
                  type="text"
                />
              </div>

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

            {/* - Menu - */}

            <div className="sm:hidden md:hidden flex items-center">
              <Menu
                className="h-8 w-8 text-white cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>

            {/* - Botões - */}

            <div className="hidden sm:flex md:flex gap-4">
              {isAuthenticated && (
                <motion.button
                  className="flex justify-center items-center w-fit bg-[#1A1A1A] hover:bg-[#333] shadow-sm shadow-[#1A1A1A] hover:shadow-md hover:shadow-[#333] text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/")}
                >
                  <FaUser className="mr-2 h-4 w-4" />
                  Perfil
                </motion.button>
              )}

              <motion.button
                className="flex justify-center items-center w-full h-fit bg-[#B8860B] hover:bg-[#7A5A08] shadow-sm shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer"
                onClick={() => {
                  if (isAuthenticated) {
                    supabase.auth.signOut();
                  } else {
                    router.replace("/login");
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ImExit className="mr-2 h-4 w-4" />

                {isAuthenticated ? "Sair" : "Entrar"}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isPortraitMobile && isMobileMenuOpen && (
          <motion.div
            className="fixed top-20 left-0 w-full flex flex-col bg-black/80 backdrop-blur-lg border rounded-lg border-[#B8860B] z-40"
            initial={{ x: 500 }}
            animate={{ x: 250 }}
            exit={{ x: 500 }}
            transition={{ duration: 0.8 }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className="px-6 py-4 text-white font-semibold border-b border-[#B8870B60] last:border-none cursor-pointer"
                  role="button"
                  onClick={() => {
                    if (link.title === "Bar") {
                      setActiveTab("bar");
                    }

                    if (link.title === "Eventos") {
                      setActiveTab("bar");
                    }

                    if (link.title === "Estatísticas") {
                      setActiveTab("analytics");
                    }
                  }}
                >
                  {link.title}
                </li>
              ))}

              <li className="px-6 py-4">
                <motion.button
                  className="flex justify-center items-center text-white font-semibold cursor-pointer"
                  onClick={() => router.replace("/login")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImExit className="mr-2 h-4 w-4" />
                  {isAuthenticated ? "Sair" : "Entrar"}
                </motion.button>
              </li>
            </ul>
          </motion.div>
        )}

        {isLandscapeMobile && isMobileMenuOpen && (
          <motion.div
            className="fixed top-16 sm:top-20 left-0 w-full flex flex-col bg-black/80 backdrop-blur-lg border rounded-lg border-[#B8860B] z-40"
            initial={{ x: 850 }}
            animate={{ x: 600 }}
            exit={{ x: 850 }}
            transition={{ duration: 0.8 }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className="px-6 py-4 text-white font-semibold border-b border-[#B8870B60] last:border-none cursor-pointer"
                  role="button"
                  onClick={() => {
                    if (link.title === "Bar") {
                      setActiveTab("bar");
                    }

                    if (link.title === "Eventos") {
                      setActiveTab("bar");
                    }

                    if (link.title === "Estatísticas") {
                      setActiveTab("analytics");
                    }
                  }}
                >
                  {link.title}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AdminHeader };
