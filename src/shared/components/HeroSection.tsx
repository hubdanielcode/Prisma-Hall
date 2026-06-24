import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { rotatingImages } from "@/shared/utils/rotatingImages";

const HeroSection = () => {
  /* - Estados das imagens - */

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [animationDirection, setAnimationDirection] = useState<string>("left");

  /* - Funções - */

  // 1. Programando o carrossel para girar automaticamente a cada 7s

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationDirection("left");
      setCurrentSlide((prev) => (prev + 1) % rotatingImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // 2. Passando para a próxima imagem de maneira manual

  const nextImage = () => {
    setAnimationDirection("left");
    setCurrentSlide((prev) => (prev + 1) % rotatingImages.length);
  };

  // 3. Voltando para a imagem anterior de maneira manual

  const previousImage = () => {
    setAnimationDirection("right");
    setCurrentSlide(
      (prev) => (prev - 1 + rotatingImages.length) % rotatingImages.length,
    );
  };

  return (
    <div className="relative h-210 sm:h-175 md:h-240 max-w-full overflow-hidden">
      <AnimatePresence
        initial={false}
        custom={animationDirection}
      >
        <motion.div
          className="absolute inset-0"
          key={currentSlide}
          custom={animationDirection}
          initial={{
            x: animationDirection === "left" ? 1000 : -1000,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animationDirection === "left" ? -1000 : 1000, opacity: 0 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          {/* - Imagem de fundo - */}

          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover"
              src={rotatingImages[currentSlide].image}
              alt={rotatingImages[currentSlide].title}
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/60 via-black/50 to-black/40" />
          </div>

          {/* - Conteúdo - */}

          <div className="relative h-[85%] max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-16 sm:mt-18 md:mt-20 flex items-center">
            <div className="max-w-2xl">
              {/* - Tag de evento em destaque - */}

              <motion.div
                className="inline-block px-4 py-2 my-8 bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-xs sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">
                  Evento em Destaque
                </span>
              </motion.div>

              {/* - Título - */}

              <motion.p
                className="text-4xl sm:text-3xl font-bold text-white mb-10 leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {rotatingImages[currentSlide].title}
              </motion.p>

              {/* - Artista - */}

              <motion.p
                className="text-lg sm:text-xl md:text-xl text-[#B8860B] text-shadow-2xs text-shadow-black font-semibold mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {rotatingImages[currentSlide].artist}
              </motion.p>

              {/* - Descrição - */}

              <motion.p
                className="text-lg sm:text-xl md:text-xl text-white/60 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {rotatingImages[currentSlide].description}
              </motion.p>

              {/* - Dia e Horário - */}

              <motion.div
                className="flex flex-col flex-wrap gap-4 sm:gap-6 text-sm sm:text-base mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 text-white text-lg sm:text-xl md:text-xl font-semibold">
                  <div className="bg-black/60 backdrop:blur-sm rounded-lg p-2">
                    <Calendar className="w-7 h-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-[#B8860B]" />
                  </div>

                  <span>
                    {rotatingImages[currentSlide].date} às{" "}
                    {rotatingImages[currentSlide].time}
                  </span>
                </div>

                {/* - Botões - */}

                <motion.div
                  className="flex flex-col sm:flex-row md:flex-row gap-4 pt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    className="group relative px-8 py-4 w-fit h-fit bg-[#B8860B] hover:bg-[#DDAE56] backdrop:blur-lg text-black rounded-lg transition-all shadow-[#B8860B] border border-black overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative flex justify-center items-center gap-2">
                      <Ticket className="w-6 h-6" />

                      <span className="font-bold whitespace-nowrap">
                        Comprar Ingresso
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    className="group relative w-fit h-fit px-12 py-4 bg-[#222222] hover:bg-[#333333] backdrop:blur-lg text-white rounded-lg transition-all border border-[#B8860B] overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative flex justify-center items-center gap-2">
                      <span className="font-bold">Mais Informações </span>
                    </div>
                  </motion.button>
                </motion.div>

                {/* - Preço - */}

                <motion.div
                  className="flex items-center gap-2 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-xl sm:text-2xl md:text-2xl text-white font-semibold mb-1">
                    A partir de{" "}
                  </span>

                  <span className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#B8860B]">
                    R$ {rotatingImages[currentSlide].price}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* - Imagem anterior - */}

      <button
        className="hidden md:flex absolute px-10 top-[50%] text-white"
        onClick={previousImage}
      >
        <ChevronLeft className="h-14 w-14 text-[#B8860B] border border-[#B8860B60] p-2 rounded-full bg-black/80 cursor-pointer" />
      </button>

      {/* - Imagem anterior - */}

      <button
        className="hidden md:flex absolute px-10 top-[50%] right-0 text-white"
        onClick={nextImage}
      >
        <ChevronRight className="h-14 w-14 text-[#B8860B] border border-[#B8860B60] p-2 rounded-full bg-black/80 cursor-pointer" />
      </button>

      {/* - Marcador de imagem - */}

      <div className="flex justify-center absolute bottom-8 h-fit w-full gap-2">
        {rotatingImages.map((_, index) => (
          <button
            className={`${index === currentSlide ? "w-12 bg-[#B8860B]" : "w-6 bg-white/30 hover:bg-white/60"} h-2 rounded-full transition-all cursor-pointer`}
            onClick={() => {
              setAnimationDirection(index > currentSlide ? "left" : "right");
              setCurrentSlide(index);
            }}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export { HeroSection };
