"use client";

import { categorySchema } from "@/lib/validations/shared/categorySchema";
import { getVoucherIncome } from "@/actions";
import { productCategories } from "@/features/bar/utils/productCategories";
import { useQueries } from "@tanstack/react-query";
import type { BarChartItemProps } from "@/features/admin/analytics-management/types/barChartItem";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import type { z } from "zod";

const useVoucherIncome = (selectedPeriod: PeriodLabelProps, selectedCategory: z.infer<typeof categorySchema> | "all_categories") => {
  /* - Definições - */

  const categories =
    selectedCategory === "all_categories" ? categorySchema.options : categorySchema.options.filter((category) => category === selectedCategory);

  /* - Query de leitura - */

  // 1. Uma consulta por categoria, já que a action exige a categoria

  const voucherIncomeQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["analytics", "voucher-income", selectedPeriod, category],
      queryFn: () => getVoucherIncome({ label: selectedPeriod, category }),
    })),
  });

  /* - Dados derivados - */

  const isLoading = voucherIncomeQueries.some((query) => query.isLoading);
  const error = voucherIncomeQueries.find((query) => query.error)?.error ?? null;

  const voucherIncomeByCategory: BarChartItemProps[] = categories.map((category, index) => {
    const result = voucherIncomeQueries[index]?.data;

    return {
      id: category,
      title: productCategories.find((productCategory) => productCategory.id === category)?.title ?? category,
      value: result ? result.totalIncome : 0,
    };
  });

  const totalVoucherIncome = voucherIncomeByCategory.reduce((accumulator, item) => accumulator + item.value, 0);

  return {
    /* - Query de leitura - */

    voucherIncomeByCategory,
    totalVoucherIncome,
    isLoading,
    error,
  };
};

export { useVoucherIncome };
