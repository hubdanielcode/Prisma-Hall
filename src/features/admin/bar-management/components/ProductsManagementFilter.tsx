"use client";

import { FaSearch } from "react-icons/fa";
import { Check, ChevronDown } from "lucide-react";
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

  /* - Definições - */

  const statusOptions = [
    { id: "all_status", title: "Ambos" },
    { id: "active", title: "Ativos" },
    { id: "inactive", title: "Inativos" },
  ] as const;

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategoryData = categories.find((category) => category.id === selectedCategory);

  /* - Funções - */

  // 1. Fechando o dropdown ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
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

  // 3. Confere se um status está marcado

  const isStatusChecked = (statusId: (typeof statusOptions)[number]["id"]) => selectedStatus === statusId;

  // 4. Marcando um status, desmarcar o que já está marcado volta para "all_status"

  const handleToggleStatus = (statusId: (typeof statusOptions)[number]["id"]) => {
    setSelectedStatus(selectedStatus === statusId ? "all_status" : statusId);
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

        {/* - Status - */}

        <div
          className={`flex items-center justify-center gap-3 bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm px-3 shrink-0 ${
            isPortraitMobile ? "flex-1" : "w-auto"
          }`}
        >
          {statusOptions.map((status) => (
            <label
              key={status.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isStatusChecked(status.id)}
                onChange={() => handleToggleStatus(status.id)}
              />

              <span
                className={`flex items-center justify-center h-5 w-5 shrink-0 rounded border border-[#B8860B] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8860B]/50 ${
                  isStatusChecked(status.id) ? "bg-[#B8860B]" : "bg-transparent"
                }`}
              >
                {isStatusChecked(status.id) && (
                  <Check
                    className="h-4 w-4 text-black"
                    strokeWidth={3}
                  />
                )}
              </span>

              <span className="text-white/60">{status.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProductsManagementFilter };
