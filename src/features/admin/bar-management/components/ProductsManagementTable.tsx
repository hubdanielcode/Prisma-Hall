import { useBarContext } from "@/features/bar";
import { motion } from "framer-motion";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { productCategoryBadges } from "../types/productCategoryBadges";
import { useMobileContext } from "@/shared";

const ProductsManagementTable = () => {
  /* - Puxando do context - */

  const { filteredProducts } = useBarContext();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);

  /* - Definições - */

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);
  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startingIndex, endingIndex);

  /* - Paginação - */

  const Pagination = () => (
    <div className="flex justify-between">
      <span className="text-sm text-white/60">
        Mostrando página <span className="font-semibold">{currentPage}</span> de{" "}
        <span className="font-semibold">{totalPages}</span>
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
  );

  /* - Visão mobile portrait: cards - */

  if (isPortraitMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* - Lista de produtos em cards - */}

        <div className="flex flex-col gap-3 text-white">
          {paginatedProducts.map((product) => {
            const badge =
              productCategoryBadges[
                product.category as keyof typeof productCategoryBadges
              ];

            return (
              <motion.div
                key={product.product_id}
                className="flex flex-col gap-3 p-3 bg-black border border-[#B8860B] rounded-lg"
              >
                {/* - Produtos - */}

                <div className="flex gap-3">
                  <img
                    className="h-18 w-18 object-cover border border-[#B8860B] rounded-lg shrink-0"
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-white font-bold text-sm leading-tight">
                        {product.name}
                      </span>

                      {/* - Preço - */}

                      <span className="text-[#B8860B] font-bold text-sm shrink-0">
                        <span className="text-xs font-semibold mr-0.5">R$</span>
                        {product.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <span className="text-white/50 text-xs line-clamp-2 leading-snug">
                      {product.description}
                    </span>

                    {/* - Categoria - */}

                    <div
                      className={`flex justify-center items-center px-2 py-1 w-fit backdrop-blur-sm border rounded-full ${badge.background} ${badge.border}`}
                    >
                      <span
                        className={`flex justify-center items-center text-xs font-semibold uppercase ${badge.text}`}
                      >
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* - Status, Criado Em e Ações - */}

                <div className="flex items-center justify-between pt-2 border-t border-[#B8860B30]">
                  <div className="flex flex-col gap-1">
                    {/* - Status - */}

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          product.status === "Ativo"
                            ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
                            : "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.6)]"
                        }`}
                      />
                      <span className="text-white text-xs font-semibold">
                        {product.status}
                      </span>
                    </div>

                    {/* - Criado Em - */}

                    <span className="text-[#B8860B] font-semibold text-xs">
                      {new Date(product.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {/* - Ações - */}

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPencilAlt className="group-hover:text-blue-400 text-xs" />
                    </motion.button>

                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTrashAlt className="group-hover:text-red-400 text-xs" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* - Paginação - */}

        <Pagination />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* - Container geral - */}

      <div className="w-full border border-[#B8860B] rounded-lg overflow-x-auto">
        <motion.table
          className={`w-full ${isLandscapeMobile ? "min-w-160]" : ""}`}
        >
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
          </colgroup>

          {/* - Cabeçalho da tabela - */}

          <thead
            className={`bg-[#0A0A0A] text-[#B8860B] trackin-wider uppercase ${
              isLandscapeMobile ? "text-xs" : "text-sm"
            }`}
          >
            <tr
              className={`border-b border-[#B6880660] ${
                isLandscapeMobile ? "h-16" : "h-20"
              }`}
            >
              <th
                className={`text-center rounded-tl-lg ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Produtos
              </th>

              <th
                className={`text-center ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Categoria
              </th>

              <th
                className={`text-center ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Preço
              </th>

              <th
                className={`text-center ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Status
              </th>

              <th
                className={`text-center ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Criado Em
              </th>

              <th
                className={`text-center rounded-tr-lg ${
                  isLandscapeMobile ? "px-3 py-2" : "px-4 py-2"
                }`}
              >
                Ações
              </th>
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
                    <div
                      className={`flex gap-1 ${
                        isLandscapeMobile ? "p-2" : "p-3"
                      }`}
                    >
                      <img
                        className={`object-cover border border-[#B8860B] rounded-lg ${
                          isLandscapeMobile
                            ? "h-12 w-12 mx-2"
                            : "h-16 w-16 mx-4"
                        }`}
                        src={product.image}
                        alt={product.name}
                      />

                      <div className="flex flex-col gap-1">
                        <span className="text-white font-bold text-sm">
                          {product.name}
                        </span>

                        <span
                          className={`text-white/60 text-xs ${
                            isLandscapeMobile ? "line-clamp-2" : "line-clamp-3"
                          }`}
                        >
                          {product.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* - Categoria - */}

                  <td>
                    <div
                      className={`flex items-center justify-center mx-auto backdrop-blur-sm border rounded-full ${
                        isLandscapeMobile ? "w-24" : "w-30"
                      } ${badge.background} ${badge.border}`}
                    >
                      <span
                        className={`flex items-center justify-center font-semibold uppercase ${
                          isLandscapeMobile
                            ? "px-3 py-1.5 text-xs"
                            : "px-4 py-2 text-xs"
                        } ${badge.text}`}
                      >
                        {product.category}
                      </span>
                    </div>
                  </td>

                  {/* - Preço - */}

                  <td className="text-center text-[#B8860B]">
                    <span
                      className={`font-bold ${
                        isLandscapeMobile ? "pl-2 pr-1" : "pl-4 pr-1"
                      }`}
                    >
                      R$
                    </span>

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
                    <span
                      className={`text-[#B8860B] ${
                        isLandscapeMobile ? "pl-2" : "pl-4"
                      }`}
                    >
                      {new Date(product.created_at).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                    </span>
                  </td>

                  {/* - Ações - */}

                  <td className="text-center">
                    <div
                      className={`flex justify-center ${
                        isLandscapeMobile ? "gap-4" : "gap-8"
                      }`}
                    >
                      {/* - Botão de editar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>
                          <FaPencilAlt className="group-hover:text-blue-400" />
                        </span>
                      </motion.button>

                      {/* - Botão de deletar - */}

                      <motion.button
                        className={`group flex justify-center items-center bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer ${
                          isLandscapeMobile ? "h-8 w-8" : "h-10 w-10"
                        }`}
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
    </div>
  );
};

export { ProductsManagementTable };
