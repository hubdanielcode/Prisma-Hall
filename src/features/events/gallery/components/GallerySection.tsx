"use client";

import { CreateGalleryPictureModal, DeleteGalleryPictureModal, EditGalleryPictureModal } from "@/features/admin";
import { eventTags } from "../../event/utils/eventTags";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { formattedDateToString } from "@/shared/utils/functions/dates";
import { Image, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuthenticationContext } from "@/features/authentication/hooks/useAuthenticationContext";
import { useGallery } from "../hooks/useGallery";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GalleryPictureProps } from "../types/galleryPicture";

const GallerySection = () => {
  /* - Puxando do context - */

  const { pictures, isLoading, error, likePictureMutation } = useGallery();
  const { isAuthenticated, user } = useAuthenticationContext();

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMore, setShowMore] = useState<boolean>(false);

  /* - Estados dos modais do admin - */

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [pictureBeingEdited, setPictureBeingEdited] = useState<GalleryPictureProps | null>(null);
  const [pictureBeingDeleted, setPictureBeingDeleted] = useState<GalleryPictureProps | null>(null);

  /* - Definições - */

  const router = useRouter();

  const isAdmin = user?.role === "admin";

  const categories = [{ id: "all", name: "Todos" }, ...eventTags.map((tag) => ({ id: tag.id, name: tag.title }))];

  /* - Funções - */

  // 1. Filtra as fotos pela tag do evento em que foram tiradas

  const filteredPictures = selectedCategory === "all" ? pictures : pictures.filter((picture) => picture.tag === selectedCategory);

  // 2. Curte (ou descurte) a foto; quem não está logado vai para o login

  const handleLikePicture = async (pictureId: string) => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    await likePictureMutation(pictureId);
  };

  return (
    <div
      className="flex flex-col w-full h-fit items-center justify-center bg-black border-t border-[#B8860B60] p-12"
      id="gallery"
    >
      {/* - Tag de galeria - */}

      <motion.div
        className="inline-block px-4 py-2 mb-10 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">Nossas Memórias</span>
      </motion.div>

      {/* - Título - */}

      <motion.span
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Reviva os Melhores Momentos
      </motion.span>

      {/* - Descrição - */}

      <motion.span
        className="my-2 text-white/60 text-center text-sm sm:text-base md:text-lg mb-6"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Fotos e vídeos dos nossos eventos mais incríveis
      </motion.span>

      {/* - Filtro - */}

      <div className="flex flex-wrap pb-6 gap-3 justify-center">
        {categories.map((category) => (
          <button
            className={`flex items-center justify-center w-40 h-12 px-4 py-2 border rounded-lg text-sm font-semibold cursor-pointer transition-colors ${selectedCategory === category.id ? "bg-[#B8860B] hover:bg-[#DDAE56] text-black border-black" : "bg-[#1A1A1A] hover:bg-[#333] text-white border-[#B8860B]"}`}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* - Botão de enviar foto (somente admin) - */}

      {isAdmin && (
        <div className="flex justify-center w-full pb-6">
          <motion.button
            className="flex justify-center items-center w-fit px-4 py-2 font-semibold bg-[#3D2B0A] hover:bg-[#4A350D] border border-[#B8860B] rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <ImagePlus className="w-5 h-5 mr-2 text-[#B8860B]" />

            <span className="text-[#B8860B]">Enviar Foto</span>
          </motion.button>
        </div>
      )}

      {/* - Estados de carregamento, erro e lista vazia - */}

      {isLoading && !error && <p className="text-white/60 text-center p-12">Carregando fotos...</p>}

      {!isLoading && error && <p className="text-red-500 text-center p-12">Erro ao buscar fotos da galeria.</p>}

      {!isLoading && !error && filteredPictures.length === 0 && <p className="text-white/60 text-center p-12">Ainda não há fotos nessa categoria.</p>}

      {/* - Card das fotos - */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...filteredPictures]
          .sort((a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime())
          .slice(0, showMore ? filteredPictures.length : 6)
          .map((photo) => (
            <motion.div
              className="group relative w-full h-fit md:w-90 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#B8860B] shadow-2xs hover:shadow-md shadow-[#DDAE56] hover:-translate-y-2.5 transition-transform duration-200 cursor-pointer"
              key={photo.id}
            >
              <img
                className="w-full object-center object-cover"
                src={photo.image}
                alt={photo.title}
              />

              {/* - Editar e excluir a foto (somente admin) - */}

              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2">
                  <motion.button
                    className="flex justify-center items-center h-9 w-9 bg-black/70 border border-[#B8860B] rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPictureBeingEdited(photo)}
                  >
                    <Pencil className="h-4 w-4 text-[#B8860B]" />
                  </motion.button>

                  <motion.button
                    className="flex justify-center items-center h-9 w-9 bg-black/70 border border-[#DF1212] rounded-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPictureBeingDeleted(photo)}
                  >
                    <Trash2 className="h-4 w-4 text-[#FF9595]" />
                  </motion.button>
                </div>
              )}

              <div className="flex items-center w-full p-5">
                <div className="flex flex-col">
                  <span className="text-white text-sm sm:text-base md:text-lg font-semibold">{photo.title}</span>

                  <span className="text-xs sm:text-sm md:text-base text-white/60">{formattedDateToString(new Date(photo.happenedAt))}</span>
                </div>

                <button
                  className="flex justify-center items-center border border-[#B8860B60] px-4 py-2 rounded-lg ml-auto cursor-pointer"
                  onClick={() => handleLikePicture(photo.id)}
                >
                  {photo.likedByMe ? (
                    <FaHeart
                      className="text-red-600 mr-3"
                      role="button"
                    />
                  ) : (
                    <FaRegHeart
                      className="text-red-600 mr-3"
                      role="button"
                    />
                  )}

                  <span className="text-white">{photo.likes}</span>
                </button>
              </div>
            </motion.div>
          ))}
      </div>

      {/* - Botão de ver mais fotos - */}

      <div className="flex justify-center w-full py-10">
        <motion.button
          className="flex justify-center items-center w-fit px-4 py-2 font-semibold bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B] rounded-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowMore(!showMore);
            if (showMore) {
              document.getElementById("gallery")?.scrollIntoView({ behavior: "auto" });
            }
          }}
        >
          <Image className="w-5 h-5 mr-2 text-[#B8860B]" />

          <span className="text-white">{showMore ? "Mostrar Menos" : "Carregar Mais Fotos"}</span>
        </motion.button>
      </div>

      {/* - Modais do admin - */}

      {isAdmin && (
        <>
          <CreateGalleryPictureModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />

          {pictureBeingEdited && (
            <EditGalleryPictureModal
              key={pictureBeingEdited.id}
              isOpen={true}
              onClose={() => setPictureBeingEdited(null)}
              picture={pictureBeingEdited}
            />
          )}

          {pictureBeingDeleted && (
            <DeleteGalleryPictureModal
              isOpen={true}
              onClose={() => setPictureBeingDeleted(null)}
              picture={pictureBeingDeleted}
            />
          )}
        </>
      )}
    </div>
  );
};

export { GallerySection };
