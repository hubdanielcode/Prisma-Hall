import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Missing = () => {
  /* - Definições - */

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center sm:justify-start">
      <div className="flex justify-center items-center w-full sm:min-h-10 min-h-screen bg-[url(./src/assets/images/ph-quinas.png)] bg-cover bg-center">
        {/* - Centralizador - */}

        <div className="flex flex-col items-center w-full mb-14 sm:my-3">
          {/* - Card - */}

          <div className="bg-black/80 rounded-lg p-6 text-white w-[90%] md:w-[25%] border border-[#B8860B60] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <div className="flex flex-col justify-center items-center text-white text-4xl sm:text-lg font-bold text-center">
              <p className="mb-6">404</p>
              <p className="text-[#B8860B] mb-6">Página Não Encontrada</p>
            </div>

            {/* - Link de página principal - */}

            <div className="flex justify-center items-center text-sm text-white font-semibold">
              <motion.span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/", { replace: true })}
              >
                Para a página principal!
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Missing };
