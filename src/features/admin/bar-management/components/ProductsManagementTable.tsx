import { useBarContext } from "@/features/bar";
import { motion } from "framer-motion";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { productCategoryBadges } from "../types/productCategoryBadges";

const ProductsManagementTable = () => {
  /* - Puxando do context - */

  const { filteredProducts } = useBarContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Definições - */

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);
  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startingIndex, endingIndex);

  return (
    <div className="flex flex-col gap-4">
      {/* - Container geral - */}

      <div className="w-full border border-[#B8860B] rounded-lg overflow-hidden">
        <motion.table className="w-full">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[15%]" />
            <col className="w-[24%]" />
          </colgroup>

          {/* - Cabeçalho da tabela - */}

          <thead className="bg-[#0A0A0A] text-[#B8860B] text-sm trackin-wider uppercase">
            <tr className="h-20 border-b border-[#B6880660]">
              <th className="px-4 py-2 text-center rounded-tl-lg">Produtos</th>

              <th className="px-4 py-2 text-center">Categoria</th>

              <th className="px-4 py-2 text-center">Preço</th>

              <th className="px-4 py-2 text-center">Status</th>

              <th className="px-4 py-2 text-center">Criado Em</th>

              <th className="px-4 py-2 text-center rounded-tr-lg">Ações</th>
            </tr>
          </thead>

          {/* - Corpo da tabela - */}

          <tbody className="bg-black text-white trackin-wider">
            {paginatedProducts.map((product, index) => {
              const isLast = index === paginatedProducts.length - 1;
              const badge =
                productCategoryBadges[
                  product.category as keyof typeof productCategoryBadges
                ];

              return (
                <tr
                  className="border-b border-[#333]"
                  key={product.product_id}
                >
                  {/* - Produtos - */}

                  <td className={`${isLast ? "rounded-bl-lg" : ""}`}>
                    <div className="flex p-3 gap-1 ">
                      <img
                        className="h-16 w-16 object-cover border border-[#B8860B] rounded-lg mx-4"
                        src={product.image}
                        alt={product.name}
                      />

                      <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-sm">
                          {product.name}
                        </span>

                        <span className="text-white/60 text-xs line-clamp-2">
                          {product.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* - Categoria - */}

                  <td>
                    <div
                      className={`mx-auto w-30 text-center backdrop-blur-sm border rounded-full ${badge.background} ${badge.border}`}
                    >
                      <span
                        className={`px-4 py-2 text-xs text-center font-semibold uppercase ${badge.text}`}
                      >
                        {product.category}
                      </span>
                    </div>
                  </td>

                  {/* - Preço - */}

                  <td className="text-center text-[#B8860B]">
                    <span className="font-bold pl-4 pr-1">R$</span>

                    <span className="font-semibold">
                      {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </td>

                  {/* - Status - */}

                  <td>
                    <div className="flex justify-center items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          product.status === "Ativo"
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span>{product.status}</span>
                    </div>
                  </td>

                  {/* - Criado Em - */}

                  <td className="text-center font-semibold">
                    <span className="pl-4 text-[#B8860B]">
                      {new Date(product.created_at).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                    </span>
                  </td>

                  {/* - Ações - */}

                  <td className="text-center">
                    <div className="flex justify-center gap-8">
                      {/* - Botão de editar - */}

                      <motion.button
                        className="group flex justify-center items-center h-10 w-10 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>
                          <FaPencilAlt className="group-hover:text-blue-400" />
                        </span>
                      </motion.button>

                      {/* - Botão de deletar - */}

                      <motion.button
                        className="group flex justify-center items-center h-10 w-10 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>
                          <FaTrashAlt className="group-hover:text-red-400" />
                        </span>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      {/* - Paginação - */}

      <div className="flex justify-between">
        <span className="text-sm text-white/60">
          Mostrando página <span className="font-semibold">{currentPage}</span>{" "}
          de <span className="font-semibold">{totalPages}</span>
        </span>

        {/* - Botões - */}

        <div className="flex w-fit space-x-1.5">
          {/* - Página anterior - */}

          <motion.button
            className="flex justify-center items-center border border-[#B8860B] bg-black hover:bg-[#0A0A0A] rounded-lg w-8 h-8 cursor-pointer disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            <ChevronLeft className="text-[#B8860B] h-5 w-5" />
          </motion.button>

          {/* - Páginas numeradas - */}

          {pages.map((page) => (
            <motion.button
              className={`flex justify-center items-center w-8 h-8 text-sm font-semibold border rounded-lg transition-colors cursor-pointer 
                ${
                  currentPage === page
                    ? "border-black text-black bg-[#B8860B]"
                    : "border-[#B8860B] text-[#B8860B] bg-black"
                }`}
              key={page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </motion.button>
          ))}

          {/* - Próxima página - */}

          <motion.button
            className="flex justify-center items-center border border-[#B8860B] bg-black hover:bg-[#0A0A0A] rounded-lg w-8 h-8 cursor-pointer disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            <ChevronRight className="text-[#B8860B] h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export { ProductsManagementTable };
