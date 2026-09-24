"use client";

import { AnimatePresence, motion } from "motion/react";
import { FaCamera } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { Menu } from "lucide-react";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfileContext } from "@/features/users";

interface ProfileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileHeader = ({ activeTab, setActiveTab }: ProfileHeaderProps) => {
  /* - Puxando do context - */

  const { profile, isLoading: isProfileLoading, updateProfileMutation } = useProfileContext();
  const { isPortraitMobile } = useMobileContext();
  const { isAuthenticated, revokeSessionMutation } = useAuthenticationContext();

  /* - Estados de foto de perfil - */

  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState<boolean>(false);

  /* - Estados de erro - */

  const [profilePictureError, setProfilePictureError] = useState<string>("");

  /* - Estados de dropdown - */

  const [isDropdownOpen, setIsDropDownOpen] = useState<boolean>(false);

  /* - Definições - */

  const router = useRouter();

  const profilePictureErrorRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePictureRef = useRef<HTMLInputElement>(null);

  const savedProfilePicture = profile ? profile.profilePicture : null;
  const displayedProfilePicture = profilePicturePreview || savedProfilePicture;

  const navLinks = [
    { id: "tickets", title: "Meus Ingressos" },
    { id: "infos", title: "Minhas Informações" },
    { id: "settings", title: "Configurações" },
  ];

  /* - Funções - */

  // 1. Permite que o usuário faça upload de um arquivo para usar como foto de perfil

  const handleUploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // 1.1 Validando o arquivo escolhido pelo usuário com relação a tipo e tamanho

    const maxFileSize = 4.5 * 1024 * 1024;
    const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (maxFileSize < selectedFile.size) {
      setProfilePictureError("A imagem deve ter um tamanho de, no máximo, 4.5MB.");
      e.target.value = "";
      return;
    }

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setProfilePictureError("Formato inválido. Escolha um arquivo com formato PNG, JPG ou WebP.");
      e.target.value ?? "";
      return;
    }

    // 1.2 Mostrando um preview do arquivo escolhido para que o usuário possa confirmar que é realmente o arquivo desejado

    const reader = new FileReader();

    reader.onload = () => setProfilePicturePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);

    // 1.3 Chamando a action que realmente valida o arquivo escolhido, sobe no vercelblob, edita o perfil e salva no banco

    setIsUploadingProfilePicture(true);

    try {
      const updatedProfilePicture = await updateProfileMutation({ profilePicture: selectedFile });

      if (!updatedProfilePicture) {
        throw new Error("Não foi possível salvar a foto.");
      }
    } catch {
      setProfilePicturePreview("");
      setProfilePictureError("Não foi possível salvar a foto.");
    } finally {
      setIsUploadingProfilePicture(false);
      e.target.value = "";
    }
  };

  // 2. Fecha o erro ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !profilePictureRef.current || profilePictureRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

      setProfilePictureError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-black backdrop-blur-lg border-b border-[#B8860B60]">
        <div className="md:max-w-full md:mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* - Logo + Links - */}

            <div className="flex items-center sm:ml-3 md:justify-center w-full">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                onClick={() => router.replace("/")}
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-linear-to-tr from-yellow-500 via-black/60 to-yellow-700 rounded-lg flex items-center justify-between shadow-xs shadow-black">
                  <Image
                    className="mx-auto"
                    src="/logo/ph-logo.png"
                    alt="PrismaHall Logo"
                    width={50}
                    height={50}
                  />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-sm sm:text-xl md:text-xl font-bold text-white whitespace-nowrap ml-1 mr-3 sm:mr-5">Prisma Hall</h1>

                  <p className="hidden sm:flex md:flex sm:text-xs md:text-xs bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 font-semibold ml-2 mb-1">
                    LIVE EXPERIENCE
                  </p>
                </div>
              </motion.div>

              {/* - Links - */}

              <div>
                <ul className="hidden sm:flex md:flex px-4 sm:px-6 gap-4 sm:gap-6">
                  {navLinks.map((link, index) => (
                    <motion.li
                      className={`my-auto font-semibold cursor-pointer ${
                        activeTab === link.id
                          ? "bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 underline"
                          : "text-white hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline"
                      }`}
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(link.id)}
                    >
                      {link.title}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* - Menu mobile - */}

            <div className="sm:hidden md:hidden flex items-center">
              <Menu
                className="h-7 w-7 cursor-pointer"
                role="button"
                onClick={() => setIsDropDownOpen(!isDropdownOpen)}
              />
            </div>

            {/* - Foto de perfil + Botão Sair/Entrar - */}

            <div className="hidden sm:flex md:flex items-center gap-4">
              <div className="relative w-15 h-15 rounded-full border border-[#B8860B]">
                {/* - Foto - */}

                {isProfileLoading && !profilePicturePreview ? (
                  <div className="w-full h-full rounded-full bg-[#1A1A1A] animate-pulse" />
                ) : displayedProfilePicture ? (
                  <img
                    className={`w-full h-full object-cover object-center rounded-full ${isUploadingProfilePicture ? "opacity-50" : ""}`}
                    src={displayedProfilePicture}
                    alt="Foto de perfil"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1A1A1A]" />
                )}

                {/* - Input de arquivo (escondido) - */}

                <input
                  className="hidden"
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadProfilePicture}
                />

                {/* - Botão de upload - */}

                <button
                  className="absolute flex items-center justify-center w-7 h-7 top-8 right-10 rounded-full text-[#B8860B] hover:text-[#DDAE56] border border-[#B8860B] bg-[#1A1A1A] hover:bg-[#333] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => profilePictureRef.current?.click()}
                  disabled={isUploadingProfilePicture}
                  aria-label="Alterar foto de perfil"
                >
                  <input
                    className="hidden"
                    type="file"
                    ref={profilePictureRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadProfilePicture}
                  />
                  <FaCamera />
                </button>
              </div>

              {/* - Botão Sair/Entrar - */}

              <motion.button
                className="flex justify-center items-center w-fit h-fit bg-[#B8860B] hover:bg-[#7A5A08] shadow-sm shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer"
                onClick={() => {
                  if (isAuthenticated) {
                    revokeSessionMutation();
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

      {/* - Seção de erro da foto - */}

      {profilePictureError && (
        <div
          className="fixed top-24 right-6 z-50 w-72 md:w-80"
          ref={profilePictureErrorRef}
        >
          <p className="flex items-center justify-center min-h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 py-2 text-center">
            {profilePictureError}
          </p>
        </div>
      )}

      <AnimatePresence>
        {isPortraitMobile && isDropdownOpen && (
          <motion.div
            className="fixed top-20 left-0 w-full flex flex-col bg-black/80 backdrop-blur-lg border rounded-lg border-[#B8860B] z-40"
            initial={{ x: 500 }}
            animate={{ x: 220 }}
            exit={{ x: 500 }}
            transition={{ duration: 1.3 }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <li
                  key={index}
                  className={`px-6 py-4 font-semibold border-b border-[#B8870B60] last:border-none cursor-pointer ${
                    activeTab === link.id ? "text-yellow-600" : "text-white"
                  }`}
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsDropDownOpen(false);
                  }}
                >
                  {link.title}
                </li>
              ))}

              <li className="px-6 py-4">
                <motion.button
                  className="flex justify-center items-center text-white font-semibold cursor-pointer"
                  onClick={() => {
                    revokeSessionMutation();
                    router.replace("/");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ImExit className="mr-2 h-3.5 w-3.5" />
                  Sair
                </motion.button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { ProfileHeader };
