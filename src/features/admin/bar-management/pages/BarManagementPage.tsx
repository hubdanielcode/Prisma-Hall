import { FaPlusCircle } from "react-icons/fa";
import {
  ProductsManagementTable,
  ProductsManagementCard,
  ProductsManagementFilter,
  CreateProductModal,
  EditProductModal,
} from "@/features/admin/index";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useMobileContext } from "@/shared";
import { useBarContext, useProductsContext } from "@/features/bar";
import { DeleteProductModal } from "../components/DeleteProductModal";

const BarManagementPage = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { filteredProducts } = useBarContext();
  const {
    productBeingEdited,
    setProductBeingEdited,
    productBeingDeleted,
    setProductBeingDeleted,
  } = useProductsContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Estados dos modais - */

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState<boolean>(false);

  /* - Definições - */

  const itemsPerPage = 6;

  /* - Funções - */

  // 1. Garantindo que o número de páginas seja recalculado sempre que um item for adicionado ou deletado

  useEffect(() => {
    const totalPages = Math.max(
      Math.ceil(filteredProducts.length / itemsPerPage),
      1,
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredProducts.length]);

  return (
    <>
      <div
        className={`bg-[#1A1A1A] min-h-screen w-full ${
          isPortraitMobile
            ? "pb-10"
            : isLandscapeMobile
              ? "pb-12 px-6"
              : "pb-14 px-8"
        }`}
      >
        <div className="flex flex-col max-w-4xl w-full mx-auto gap-6 px-4">
          <div
            className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}
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
              onClick={() => setIsCreateProductModalOpen(true)}
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

          <ProductsManagementFilter
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Tabela de produtos - */}

          <ProductsManagementTable
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* - Modal de criação de produtos - */}

          {isCreateProductModalOpen ? (
            <CreateProductModal
              isOpen={isCreateProductModalOpen}
              onClose={() => setIsCreateProductModalOpen(false)}
            />
          ) : null}

          {/* - Modal de edição de produtos - */}

          {productBeingEdited ? (
            <EditProductModal
              isOpen={!!productBeingEdited}
              onClose={() => setProductBeingEdited(null)}
            />
          ) : null}

          {/* - Modal de deleção de produtos - */}

          {productBeingDeleted ? (
            <DeleteProductModal
              isOpen={!!productBeingDeleted}
              onClose={() => setProductBeingDeleted(null)}
              product={productBeingDeleted}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export { BarManagementPage };
