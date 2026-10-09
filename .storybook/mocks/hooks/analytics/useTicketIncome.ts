import type { BarChartItemProps } from "@/features/admin/analytics-management/types/barChartItem";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import { eventTags } from "@/features/events/event/utils/eventTags";
import { fakeTickets } from "../users/useTickets";

const fakeTicketIncomeByTag: BarChartItemProps[] = eventTags.map((tag) => ({
  id: tag.id,
  title: tag.title,
  value: fakeTickets
    .filter((ticket) => ticket.paymentStatus === "confirmed" && ticket.event.tag === tag.id)
    .reduce((accumulator, ticket) => accumulator + ticket.quantity * ticket.unitPrice, 0),
}));

const fakeTicketIncome = fakeTicketIncomeByTag[0];

const useTicketIncome = (_selectedPeriod: PeriodLabelProps, selectedTag: string) => {
  const ticketIncomeByTag = selectedTag === "all_tags" ? fakeTicketIncomeByTag : fakeTicketIncomeByTag.filter((item) => item.id === selectedTag);

  return {
    ticketIncomeByTag,
    totalTicketIncome: ticketIncomeByTag.reduce((accumulator, item) => accumulator + item.value, 0),
    isLoading: false,
    error: null,
  };
};

export { useTicketIncome, fakeTicketIncomeByTag, fakeTicketIncome };
