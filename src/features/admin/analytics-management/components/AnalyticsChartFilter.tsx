"use client";

import { ChevronDown } from "lucide-react";
import { periodOptions, type PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import { useEffect, useRef, useState } from "react";

interface AnalyticsChartFilterProps {
  selectedPeriod: PeriodLabelProps;
  onPeriodChange: (periodId: PeriodLabelProps) => void;
  categoryOptions: { id: string; title: string }[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const AnalyticsChartFilter = ({ selectedPeriod, onPeriodChange, categoryOptions, selectedCategory, onCategoryChange }: AnalyticsChartFilterProps) => {
  /* - Estados dos dropdowns - */

  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  /* - Definições - */

  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const selectedPeriodData = periodOptions.find((period) => period.id === selectedPeriod);
  const selectedCategoryData = categoryOptions.find((category) => category.id === selectedCategory);

  /* - Funções - */

  // 1. Fechando os dropdowns ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }

      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Selecionando um período

  const handleSelectPeriod = (periodId: PeriodLabelProps) => {
    onPeriodChange(periodId);
    setIsPeriodDropdownOpen(false);
  };

  // 3. Selecionando uma categoria

  const handleSelectCategory = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div className="flex flex-row items-center gap-2.5 w-full">
      {/* - Filtro de período - */}

      <div
        className="relative flex-1 min-w-0"
        ref={periodDropdownRef}
      >
        <button
          type="button"
          className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
          onClick={() => setIsPeriodDropdownOpen((prev) => !prev)}
        >
          <span className="text-white font-semibold truncate">{selectedPeriodData?.title ?? "Este Mês"}</span>

          <ChevronDown className={`h-4 w-4 shrink-0 text-[#B8860B] transition-transform ${isPeriodDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isPeriodDropdownOpen && (
          <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
            {periodOptions.map((period) => (
              <li key={period.id}>
                <button
                  type="button"
                  className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                    selectedPeriod === period.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                  }`}
                  onClick={() => handleSelectPeriod(period.id)}
                >
                  {period.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* - Filtro de categoria - */}

      <div
        className="relative flex-1 min-w-0"
        ref={categoryDropdownRef}
      >
        <button
          type="button"
          className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
          onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
        >
          <span className="text-white font-semibold truncate">{selectedCategoryData?.title ?? categoryOptions[0]?.title}</span>

          <ChevronDown className={`h-4 w-4 shrink-0 text-[#B8860B] transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isCategoryDropdownOpen && (
          <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
            {categoryOptions.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                    selectedCategory === category.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                  }`}
                  onClick={() => handleSelectCategory(category.id)}
                >
                  {category.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export { AnalyticsChartFilter };
