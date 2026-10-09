"use client";

import { AnalyticsChartFilter } from "@/features/admin/analytics-management/components/AnalyticsChartFilter";
import { BarChartList } from "@/features/admin/analytics-management/components/BarChartList";
import { categorySchema } from "@/lib/validations/shared/categorySchema";
import { FaCocktail } from "react-icons/fa";
import { formatCurrency } from "@/shared/utils/functions/formatters";
import { productCategories } from "@/features/bar/utils/productCategories";
import { useState } from "react";
import { useVoucherIncome } from "@/features/admin/analytics-management/hooks/useVoucherIncome";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import type { z } from "zod";

const VoucherIncomeChart = () => {
  /* - Estados dos filtros - */

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabelProps>("this month");
  const [selectedCategory, setSelectedCategory] = useState<z.infer<typeof categorySchema> | "all_categories">("all_categories");

  /* - Dados do gráfico - */

  const { voucherIncomeByCategory, isLoading } = useVoucherIncome(selectedPeriod, selectedCategory);

  /* - Definições - */

  const categoryOptions = [{ id: "all_categories", title: "Todas as categorias" }, ...productCategories];

  return (
    <div className="flex flex-col flex-1 gap-4 bg-black border border-[#B8860B] rounded-lg p-4">
      {/* - Título - */}

      <div className="flex items-center gap-2">
        <FaCocktail className="text-[#B8860B]" />

        <span className="text-white text-sm font-semibold uppercase">Bar por categoria</span>
      </div>

      {/* - Filtro - */}

      <AnalyticsChartFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={(categoryId) => setSelectedCategory(categoryId as z.infer<typeof categorySchema> | "all_categories")}
      />

      {/* - Gráfico - */}

      <BarChartList
        items={voucherIncomeByCategory}
        isLoading={isLoading}
        formatValue={formatCurrency}
        emptyMessage="Nenhum pedido confirmado neste período."
      />
    </div>
  );
};

export { VoucherIncomeChart };
