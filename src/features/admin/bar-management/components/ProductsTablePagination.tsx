"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductsTablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ProductsTablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ProductsTablePaginationProps) => {
  /* - Definições - */

  const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);

  return (
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
          onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(page)}
          >
            {page}
          </motion.button>
        ))}

        {/* - Próxima página - */}

        <motion.button
          className="flex justify-center items-center border border-[#B8860B] bg-black hover:bg-[#0A0A0A] rounded-lg w-8 h-8 cursor-pointer disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="text-[#B8860B] h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export { ProductsTablePagination };
