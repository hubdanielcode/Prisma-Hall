"use client";

import { BarChartItemProps } from "../types/barChartItem";
import { eventTags } from "@/features/events/event/utils/eventTags";
import { getTicketIncome } from "@/actions/admin/analytics-management/getTicketIncome";
import { PeriodLabelProps } from "../types/period";
import { tagSchema, tagFilterSchema } from "@/lib/validations";
import { useQueries } from "@tanstack/react-query";
import type { z } from "zod";

const useTicketIncome = (selectedPeriod: PeriodLabelProps, selectedTag: z.infer<typeof tagFilterSchema>) => {
  /* - Definições - */

  const tags = selectedTag === "all_tags" ? tagSchema.options : tagSchema.options.filter((tag) => tag === selectedTag);

  /* - Query de leitura - */

  // 1. Uma consulta por gênero, já que a action exige a tag

  const ticketIncomeQueries = useQueries({
    queries: tags.map((tag) => ({
      queryKey: ["analytics", "ticket-income", selectedPeriod, tag],
      queryFn: () => getTicketIncome({ label: selectedPeriod, tag }),
    })),
  });

  /* - Dados derivados - */

  const isLoading = ticketIncomeQueries.some((query) => query.isLoading);

  const ticketIncomeByTag: BarChartItemProps[] = tags.map((tag, index) => {
    const result = ticketIncomeQueries[index]?.data;

    return {
      id: tag,
      title: eventTags.find((eventTag) => eventTag.id === tag)?.title ?? tag,
      value: result ? result.totalIncome : 0,
    };
  });

  const totalTicketIncome = ticketIncomeByTag.reduce((accumulator, item) => accumulator + item.value, 0);

  return {
    /* - Query de leitura - */

    ticketIncomeByTag,
    totalTicketIncome,
    isLoading,
  };
};

export { useTicketIncome };
