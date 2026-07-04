import { FaPlusCircle } from "react-icons/fa";
import { ProductsManagementTable } from "../components/ProductsManagementTable";
import { motion } from "framer-motion";
import { ProductsManagementCard } from "../components/ProductsManagementCard";
import { ProductsManagementFilter } from "../components/ProductsManagementFilter";
import { useState } from "react";
import { NewProductModal } from "../components/NewProductModal";
import { useMobileContext } from "@/shared";

const AdminPage = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Estados dos modais - */

  const [isNewProductModalOpen, setIsNewProductModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <div
        className={`bg-[#1A1A1A] min-h-screen w-full ${
          isPortraitMobile
            ? "pt-24 pb-10"
            : isLandscapeMobile
              ? "pt-28 pb-12 px-6"
              : "pt-32 pb-14 px-8"
        }`}
      >
        <div className="flex flex-col max-w-4xl w-full mx-auto gap-6 px-4">
          <div
            className={`flex ${
              isPortraitMobile
                ? "flex-col"
                : "flex-row justify-between items-stretch gap-0"
            }`}
          >
            {/* - Título - */}

            <div
              className={`flex flex-col items-start ${
                isPortraitMobile ? "mb-4" : "mb-0"
              }`}
            >
              <span
                className={`text-white font-semibold ${
                  isPortraitMobile
                    ? "text-lg"
                    : isLandscapeMobile
                      ? "text-xl"
                      : "text-2xl"
                }`}
              >
                Gestão do Bar
              </span>

              {/* - Subtítulo - */}

              <span className="text-white/60">
                Gerencie os produtos do cardápio
              </span>
            </div>

            {/* - Botão de adicionar produto - */}

            <motion.button
              className={`flex justify-center items-center bg-[#B8860B] hover:bg-[#7A5A08] shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer ${
                isPortraitMobile
                  ? "w-full h-12"
                  : isLandscapeMobile
                    ? "w-fit h-15"
                    : "w-auto h-fit"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewProductModalOpen(true)}
            >
              <FaPlusCircle className="mr-2" />
              Novo Produto
            </motion.button>
          </div>

          {/* - Cards dos produtos - */}

          <div className="flex justify-center">
            <ProductsManagementCard />
          </div>

          {/* - Filtro - */}

          <ProductsManagementFilter />

          {/* - Tabela de produtos - */}

          <ProductsManagementTable />
        </div>
      </div>

      {isNewProductModalOpen ? (
        <NewProductModal
          isOpen={isNewProductModalOpen}
          onClose={() => setIsNewProductModalOpen(false)}
        />
      ) : (
        ""
      )}
    </>
  );
};

export { AdminPage };
