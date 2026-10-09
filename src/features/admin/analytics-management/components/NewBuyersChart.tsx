"use client";

import { AnalyticsChartFilter } from "@/features/admin/analytics-management/components/AnalyticsChartFilter";
import { BarChartList } from "@/features/admin/analytics-management/components/BarChartList";
import { eventTags } from "@/features/events/event/utils/eventTags";
import { FaUsers } from "react-icons/fa";
import { formatPeople } from "@/shared/utils/functions/formatters";
import { tagFilterSchema } from "@/lib/validations";
import { useNewVisitors } from "@/features/admin/analytics-management/hooks/useNewVisitors";
import { useState } from "react";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import type { z } from "zod";

const NewBuyersChart = () => {
  /* - Estados dos filtros - */

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabelProps>("this month");
  const [selectedTag, setSelectedTag] = useState<z.infer<typeof tagFilterSchema>>("all_tags");

  /* - Dados do gráfico - */

  const { buyersByTag, isLoading } = useNewVisitors(selectedPeriod, selectedTag);

  /* - Definições - */

  const tagOptions = [{ id: "all_tags", title: "Todos os Gêneros" }, ...eventTags];

  return (
    <div className="flex flex-col gap-4 bg-black border border-[#B8860B] rounded-lg p-4">
      {/* - Título - */}

      <div className="flex items-center gap-2">
        <FaUsers className="text-[#B8860B]" />

        <span className="text-white text-sm font-semibold uppercase">Novos compradores por gênero</span>
      </div>

      {/* - Filtro - */}

      <AnalyticsChartFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        categoryOptions={tagOptions}
        selectedCategory={selectedTag}
        onCategoryChange={(tagId) => setSelectedTag(tagId as z.infer<typeof tagFilterSchema>)}
      />

      {/* - Gráfico - */}

      <BarChartList
        items={buyersByTag}
        isLoading={isLoading}
        formatValue={formatPeople}
        emptyMessage="Nenhum novo comprador neste período."
      />
    </div>
  );
};

export { NewBuyersChart };
