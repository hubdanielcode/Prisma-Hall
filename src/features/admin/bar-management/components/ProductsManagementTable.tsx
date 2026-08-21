import { useBarContext, useProductsContext } from "@/features/bar";
import { motion } from "motion/react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

import { productCategoryBadges } from "../types/productCategoryBadges";
import { masks, useMobileContext } from "@/shared";
import { TablePagination } from "./TablePagination";

interface ProductsManagementTableProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ProductsManagementTable = ({
  currentPage,
  onPageChange,
}: ProductsManagementTableProps) => {
  /* - Puxando do context - */

  const { setProductBeingEdited, setProductBeingDeleted } =
    useProductsContext();
  const { filteredProducts } = useBarContext();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startingIndex = (currentPage - 1) * itemsPerPage;
  const endingIndex = currentPage * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startingIndex, endingIndex);

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
                        {masks.productName(product.name)}
                      </span>

                      {/* - Preço - */}

                      <span className="text-[#B8860B] font-bold text-sm shrink-0">
                        <span className="text-xs font-semibold mr-0.5">R$</span>
                        {masks.productPrice(
                          product.price.toFixed(2).replace(".", ","),
                        )}
                      </span>
                    </div>

                    <span className="text-white/50 text-xs line-clamp-2 leading-snug">
                      {masks.productDescription(product.description)}
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
                      onClick={() => setProductBeingEdited(product)}
                    >
                      <FaPencilAlt className="group-hover:text-blue-400 text-xs" />
                    </motion.button>

                    <motion.button
                      className="group flex justify-center items-center h-9 w-9 bg-[#1A1A1A] hover:bg-[#333] border border-[#B8860B60] rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setProductBeingDeleted(product);
                      }}
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

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
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
                          {masks.productName(product.name)}
                        </span>

                        <span
                          className={`text-white/60 text-xs ${
                            isLandscapeMobile ? "line-clamp-2" : "line-clamp-3"
                          }`}
                        >
                          {masks.productDescription(product.description)}
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
                      {masks.productPrice(
                        product.price.toFixed(2).replace(".", ","),
                      )}
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
                        onClick={() => setProductBeingEdited(product)}
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
                        onClick={() => setProductBeingDeleted(product)}
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

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export { ProductsManagementTable };
