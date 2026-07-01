import { motion } from "framer-motion";
import { Image } from "lucide-react";
import { photos, photosCategories } from "../../../../shared/utils/photos";
import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { parsedDate } from "@/shared";

const GalerySection = () => {
  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMore, setShowMore] = useState<boolean>(false);

  /* - Estados de curtida - */

  const [isLiked, setIsLiked] = useState<Record<number, boolean>>({});

  /* - Funções - */

  // 1. Filtra as fotos por categoria

  const filteredPhotos =
    selectedCategory === "all"
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  // 2. Dá like na foto

  const handleLikePicture = (id: number) => {
    setIsLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="flex flex-col w-full h-fit items-center justify-center border-t border-[#B8860B60] p-12"
      id="galery"
    >
      {/* - Tag de galeria - */}

      <motion.div
        className="inline-block px-4 py-2 mb-10 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">
          Nossas Memórias
        </span>
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
        {photosCategories.map((category) => (
          <button
            className={`flex items-center justify-center w-40 h-12 px-4 py-2 border rounded-lg text-sm font-semibold cursor-pointer transition-colors ${selectedCategory === category.id ? "bg-[#B8860B] hover:bg-[#DDAE56] text-black border-black" : "bg-[#1A1A1A] hover:bg-[#333] text-white border-[#B8860B]"}`}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* - Card das fotos - */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPhotos
          .sort(
            (a, b) =>
              parsedDate(b.date).getTime() - parsedDate(a.date).getTime(),
          )
          .slice(0, showMore ? photos.length : 6)
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

              <div className="flex items-center w-full p-5">
                <div className="flex flex-col">
                  <span className="text-white text-sm sm:text-base md:text-lg font-semibold">
                    {photo.title}
                  </span>

                  <span className="text-xs sm:text-sm md:text-base text-white/60">
                    {photo.date}
                  </span>
                </div>

                <button
                  className="flex justify-center items-center border border-[#B8860B60] px-4 py-2 rounded-lg ml-auto cursor-pointer"
                  onClick={() => handleLikePicture(photo.id)}
                >
                  {isLiked[photo.id] ? (
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

                  <span className="text-white">
                    {photo.likes + (isLiked[photo.id] ? 1 : 0)}
                  </span>
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
              document
                .getElementById("galery")
                ?.scrollIntoView({ behavior: "auto" });
            }
          }}
        >
          <Image className="w-5 h-5 mr-2 text-[#B8860B]" />

          <span className="text-white">
            {showMore ? "Mostrar Menos" : "Carregar Mais Fotos"}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export { GalerySection };
