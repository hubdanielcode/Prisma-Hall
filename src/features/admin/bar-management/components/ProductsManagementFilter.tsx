"use client";

import { FaSearch } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { useBarContext } from "@/features/bar/hooks/useBarContext";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useEffect, useRef, useState } from "react";

interface ProductsManagementFilterProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ProductsManagementFilter = ({ onPageChange }: ProductsManagementFilterProps) => {
  /* - Puxando do context - */

  const { categories, selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, searchQuery, setSearchQuery } = useBarContext();
  const { isPortraitMobile } = useMobileContext();

  /* - Estados dos dropdowns - */

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  /* - Definições - */

  const statusOptions = [
    { id: "all_status", title: "Ambos" },
    { id: "active", title: "Ativo" },
    { id: "inactive", title: "Inativo" },
  ] as const;

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategoryData = categories.find((category) => category.id === selectedCategory);
  const selectedStatusData = statusOptions.find((status) => status.id === selectedStatus);

  /* - Funções - */

  // 1. Fechando os dropdowns ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }

      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Selecionando uma categoria

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsCategoryDropdownOpen(false);
    onPageChange(1);
  };

  // 3. Selecionando um status

  const handleSelectStatus = (statusId: (typeof statusOptions)[number]["id"]) => {
    setSelectedStatus(statusId);
    setIsStatusDropdownOpen(false);
    onPageChange(1);
  };

  return (
    <div className={`flex w-full gap-3 ${isPortraitMobile ? "flex-col" : "flex-row items-center"}`}>
      {/* - Searchbar - */}

      <div
        className={`flex items-center bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none p-2 shrink-0 ${
          isPortraitMobile ? "w-full" : "flex-1"
        }`}
      >
        <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

        <input
          className="bg-transparent text-white font-semibold text-sm outline-none focus:outline-none w-full"
          placeholder="Buscar Produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* - Filtro - */}

      <div className={`flex flex-row items-center gap-2.5 ${isPortraitMobile ? "w-full" : "shrink-0"}`}>
        <div
          className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-56"}`}
          ref={categoryDropdownRef}
        >
          <button
            type="button"
            className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
            onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
          >
            <span className="text-white font-semibold">{selectedCategoryData?.title ?? "Todas as Categorias"}</span>

            <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isCategoryDropdownOpen && (
            <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                        selectedCategory === category.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                      }`}
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2 shrink-0" />

                      {category.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className={`relative shrink-0 ${isPortraitMobile ? "flex-1" : "w-48"}`}
          ref={statusDropdownRef}
        >
          <button
            type="button"
            className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
            onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
          >
            <span className="text-white font-semibold">{selectedStatusData?.title ?? "Ambos"}</span>

            <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isStatusDropdownOpen && (
            <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
              {statusOptions.map((status) => (
                <li key={status.id}>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                      selectedStatus === status.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                    }`}
                    onClick={() => handleSelectStatus(status.id)}
                  >
                    {status.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export { ProductsManagementFilter };
