import { AnimatePresence, motion } from "framer-motion";
import PrismaHall from "@/assets/logo/ph-logo.png";
import { Menu } from "lucide-react";
import { FaCamera } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import { useMobileContext } from "@/shared";
import { ImExit } from "react-icons/im";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, supabaseTemp } from "../../../../../supabase/supabase";

interface ProfilePageHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfilePageHeader = ({
  activeTab,
  setActiveTab,
}: ProfilePageHeaderProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile } = useMobileContext();

  /* - Estados da foto - */

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState<boolean>(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  /* - Estados de dropdown - */

  const [isDropdownOpen, setIsDropDownOpen] = useState<boolean>(false);

  /* - Definições - */

  const navLinks = [
    { id: "tickets", title: "Meus Ingressos" },
    { id: "infos", title: "Minhas Informações" },
    { id: "settings", title: "Configurações" },
  ];

  const ProfilePictureRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from ?? "/";

  const rememberMe = localStorage.getItem("rememberMe");
  const client = rememberMe ? supabase : supabaseTemp;

  /* - Funções - */

  // 1. Busca a foto de perfil do usuário ao renderizar a página

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        setIsLoadingPhoto(false);
        return;
      }

      const { data, error } = await client
        .from("users")
        .select("photo")
        .eq("user_id", user.id)
        .single();

      if (error || !data?.photo) {
        setIsLoadingPhoto(false);
        return;
      }

      setProfilePicture(data.photo);
      setIsLoadingPhoto(false);
    };

    fetchProfilePicture();
  }, []);

  // 2. Permite que o usuário faça upload de uma foto para usar como foto de perfil

  const handleUploadProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const maxSize = 5 * 1024 * 1024;

    if (!file || file.size > maxSize) {
      return;
    }

    const allowedFileTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedFileTypes.includes(file.type)) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => setProfilePicture(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setIsUploadingPhoto(true);
      await handleSaveProfilePicture(file);
    } catch (err) {
      console.error("Erro ao salvar foto:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 3. Permite que a foto seja salva no supabase

  const handleSaveProfilePicture = async (file: File) => {
    // 3.1 Descobrindo quem foi o usuário que subiu a foto

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado!");
    }

    // 3.2 Definindo o caminho da foto no bucket do supabase

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // 3.3 Subindo a foto no supabase

    const { error: uploadError } = await client.storage
      .from("Profile_Pictures")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error("Erro ao fazer upload da foto.");
    }

    // 3.4 Convertendo a URL do bucket para URL pública

    const {
      data: { publicUrl },
    } = client.storage.from("Profile_Pictures").getPublicUrl(filePath);

    // 3.5 Salvando essa URL pública na tabela de usuários

    const { error: savingURLError } = await client
      .from("users")
      .update({ photo: publicUrl })
      .eq("user_id", user.id);

    if (savingURLError) {
      throw new Error("Erro ao salvar foto no banco de dados.");
    }

    // 3.6 Atualizando o estado local com a URL pública

    setProfilePicture(publicUrl);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-black backdrop-blur-lg border-b border-[#B8860B60]">
        <div className="md:max-w-full md:mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="relative flex items-center sm:ml-3 md:justify-center w-full">
              {/* - Logo - */}

              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                onClick={() => navigate("/", { replace: true })}
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-linear-to-tr from-yellow-500 via-black/60 to-yellow-700 rounded-lg flex items-center justify-between shadow-xs shadow-black">
                  <img
                    src={PrismaHall}
                    alt="PrismaHall Logo"
                  />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-sm sm:text-xl md:text-xl font-bold text-white whitespace-nowrap ml-1 mr-3 sm:mr-5">
                    Prisma Hall
                  </h1>

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

              {/* - Foto de perfil - */}

              <div className="absolute flex justify-center items-center right-2 sm:right-4">
                <div className="relative w-15 h-15 rounded-full border border-[#B8860B]">
                  {/* - Loading skeleton - */}

                  {isLoadingPhoto ? (
                    <div className="w-full h-full rounded-full bg-[#1A1A1A] animate-pulse" />
                  ) : profilePicture ? (
                    <img
                      className="w-full h-full object-cover object-center rounded-full"
                      src={profilePicture}
                      alt="Foto de perfil"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#1A1A1A]" />
                  )}

                  {/* - Botão de upload - */}

                  <button
                    className="absolute flex items-center justify-center w-7 h-7 top-8 right-10 rounded-full text-[#B8860B] hover:text-[#DDAE56] border border-[#B8860B] bg-[#1A1A1A] hover:bg-[#333] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => ProfilePictureRef.current?.click()}
                    disabled={isUploadingPhoto}
                    aria-label="Alterar foto de perfil"
                  >
                    <input
                      className="hidden"
                      type="file"
                      ref={ProfilePictureRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUploadProfilePicture}
                    />
                    <FaCamera />
                  </button>
                </div>

                <Menu
                  className="sm:hidden md:hidden h-7 w-7 ml-3 cursor-pointer"
                  role="button"
                  onClick={() => setIsDropDownOpen(!isDropdownOpen)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

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
                    supabase.auth.signOut();
                    navigate(from, { replace: true });
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

export { ProfilePageHeader };
