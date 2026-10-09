"use client";

import { eventTags } from "@/features/events/event/utils/eventTags";
import { getNewVisitors } from "@/actions";
import { tagFilterSchema } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";
import type { BarChartItemProps } from "@/features/admin/analytics-management/types/barChartItem";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import type { z } from "zod";

const useNewVisitors = (selectedPeriod: PeriodLabelProps, selectedTag: z.infer<typeof tagFilterSchema>) => {
  /* - Query de leitura - */

  const {
    data: visitorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analytics", "new-visitors", selectedPeriod, selectedTag],
    queryFn: () => getNewVisitors({ label: selectedPeriod, tag: selectedTag }),
  });

  /* - Dados derivados - */

  const buyersByTag: BarChartItemProps[] = visitorsData
    ? visitorsData.buyersByTag.map((item) => ({
        id: item.tag,
        title: eventTags.find((eventTag) => eventTag.id === item.tag)?.title ?? item.tag,
        value: item.totalBuyers,
      }))
    : [];

  const totalNewUsers = visitorsData ? visitorsData.newUsers : 0;
  const totalBuyers = visitorsData ? visitorsData.buyers : 0;

  return {
    /* - Query de leitura - */

    buyersByTag,
    totalNewUsers,
    totalBuyers,
    isLoading,
    error,
  };
};

export { useNewVisitors };
