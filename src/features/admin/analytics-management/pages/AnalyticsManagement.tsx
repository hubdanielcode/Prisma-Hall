"use client";

import { ChevronDown } from "lucide-react";
import { eventTags } from "@/features/events/event/utils/eventTags";
import { NewBuyersChart, TicketIncomeChart, VoucherIncomeChart } from "@/features/admin";
import { AnalyticsCard } from "../components/AnalyticsCard";
import { periodOptions, type PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import { tagFilterSchema } from "@/lib/validations";
import { useEffect, useRef, useState } from "react";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import type { z } from "zod";

const AnalyticsManagement = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Estados dos filtros - */

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabelProps>("this month");
  const [selectedTag, setSelectedTag] = useState<z.infer<typeof tagFilterSchema>>("all_tags");

  /* - Estados dos dropdowns - */

  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  /* - Definições - */

  const tagOptions = [{ id: "all_tags", title: "Todos os Gêneros" }, ...eventTags];

  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const selectedPeriodData = periodOptions.find((period) => period.id === selectedPeriod);
  const selectedTagData = tagOptions.find((tag) => tag.id === selectedTag);

  /* - Funções - */

  // 1. Fechando os dropdowns ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }

      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Selecionando um período

  const handleSelectPeriod = (periodId: PeriodLabelProps) => {
    setSelectedPeriod(periodId);
    setIsPeriodDropdownOpen(false);
  };

  // 3. Selecionando um gênero

  const handleSelectTag = (tagId: string) => {
    setSelectedTag(tagId as z.infer<typeof tagFilterSchema>);
    setIsTagDropdownOpen(false);
  };

  return (
    <>
      <div className={`bg-[#1A1A1A] min-h-screen w-full ${isPortraitMobile ? "pb-10" : isLandscapeMobile ? "pb-12 px-6" : "pb-14 px-8"}`}>
        <div className="flex flex-col max-w-6xl w-full mx-auto gap-6 px-4">
          <div className={`flex ${isPortraitMobile ? "flex-col" : "flex-row justify-between items-stretch gap-0"}`}>
            {/* - Título - */}

            <div className={`flex flex-col items-start ${isPortraitMobile ? "mb-4" : "mb-0"}`}>
              <span className={`text-white font-semibold mb-2 ${isPortraitMobile ? "text-lg" : isLandscapeMobile ? "text-xl" : "text-2xl"}`}>
                Estatísticas
              </span>

              {/* - Subtítulo - */}

              <span className="text-white/60 text-nowrap mb-12">Acompanhe o faturamento da casa e o comportamento do público</span>
            </div>

            {/* - Filtros - */}

            <div className={`flex w-full gap-3 ${isPortraitMobile ? "flex-col" : "flex-row items-center justify-end"}`}>
              {/* - Filtro de período - */}

              <div
                className={`relative shrink-0 ${isPortraitMobile ? "w-full" : "w-56"}`}
                ref={periodDropdownRef}
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
                  onClick={() => setIsPeriodDropdownOpen((prev) => !prev)}
                >
                  <span className="text-white font-semibold">{selectedPeriodData?.title ?? "Este Mês"}</span>

                  <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isPeriodDropdownOpen ? "rotate-180" : ""}`} />
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

              {/* - Filtro de gênero - */}

              <div
                className={`relative shrink-0 ${isPortraitMobile ? "w-full" : "w-56"}`}
                ref={tagDropdownRef}
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full bg-[#0A0A0A] border border-[#B8860B] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none px-3 shrink-0 cursor-pointer"
                  onClick={() => setIsTagDropdownOpen((prev) => !prev)}
                >
                  <span className="text-white font-semibold">{selectedTagData?.title ?? "Todos os Gêneros"}</span>

                  <ChevronDown className={`h-4 w-4 text-[#B8860B] transition-transform ${isTagDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isTagDropdownOpen && (
                  <ul className="absolute z-20 mt-2 w-full bg-[#0A0A0A] border border-[#B8860B] rounded-lg overflow-hidden shadow-lg shadow-black/40">
                    {tagOptions.map((tag) => (
                      <li key={tag.id}>
                        <button
                          type="button"
                          className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm text-left cursor-pointer transition-colors ${
                            selectedTag === tag.id ? "bg-[#B8860B] text-black font-semibold" : "text-white/80 hover:bg-[#1A1A1A]"
                          }`}
                          onClick={() => handleSelectTag(tag.id)}
                        >
                          {tag.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* - Cards de resumo - */}

          <AnalyticsCard
            selectedPeriod={selectedPeriod}
            selectedTag={selectedTag}
          />

          {/* - Gráficos de fluxo de caixa - */}

          <div className={`flex w-full gap-4 ${isPortraitMobile ? "flex-col" : "flex-row items-stretch"}`}>
            <TicketIncomeChart />

            <VoucherIncomeChart />
          </div>

          {/* - Gráfico de pessoas - */}

          <NewBuyersChart />
        </div>
      </div>
    </>
  );
};

export { AnalyticsManagement };
