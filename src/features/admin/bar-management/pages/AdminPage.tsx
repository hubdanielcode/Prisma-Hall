import { FaPlusCircle } from "react-icons/fa";
import { ProductsManagementTable } from "../components/ProductsManagementTable";
import { motion } from "framer-motion";
import { ProductsManagementCard } from "../components/ProductsManagementCard";
import { ProductsManagementFilter } from "../components/ProductsManagementFilter";
import { useState } from "react";
import { NewProductModal } from "../components/NewProductModal";

const AdminPage = () => {
  /* - Estados dos modais - */

  const [isNewProductModalOpen, setIsNewProductModalOpen] =
    useState<boolean>(false);

  return (
    <>
      <div className="bg-[#1A1A1A] min-h-screen w-full pt-24 pb-10 sm:pt-28 sm:pb-12 sm:px-6 md:pt-32 md:pb-14 md:px-8">
        <div className="flex flex-col max-w-4xl w-full mx-auto gap-6 px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-stretch md:flex-row md:justify-between md:items-stretch md:gap-0 ">
            {/* - Título - */}

            <div className="flex flex-col items-start mb-4 sm:mb-0 md:mb-0">
              <span className="text-lg sm:text-xl md:text-2xl text-white font-semibold">
                Gestão do Bar
              </span>

              {/* - Subtítulo - */}

              <span className="text-white/60">
                Gerencie os produtos do cardápio
              </span>
            </div>

            {/* - Botão de adicionar produto - */}

            <motion.button
              className="flex justify-center items-center w-full sm:w-fit md:w-auto h-12 sm:h-15 md:h-fit bg-[#B8860B] hover:bg-[#7A5A08] shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer"
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
