import { eventTags } from "@/features/events/event/utils/eventTags";
import { fakeTickets } from "../users/tickets/useTickets";
import { fakeUsers } from "../users/user/useUsers";
import type { BarChartItemProps, PeriodLabelProps } from "@/features/admin/analytics-management";

const fakeConfirmedTickets = fakeTickets.filter((ticket) => ticket.paymentStatus === "confirmed");

const fakeBuyersByTag: BarChartItemProps[] = eventTags.map((tag) => ({
  id: tag.id,
  title: tag.title,
  value: new Set(fakeConfirmedTickets.filter((ticket) => ticket.event.tag === tag.id).map((ticket) => ticket.orderId)).size,
}));

const fakeBuyer = fakeBuyersByTag[0];

const useNewVisitors = (_selectedPeriod: PeriodLabelProps, selectedTag: string) => {
  const buyersByTag = selectedTag === "all_tags" ? fakeBuyersByTag : fakeBuyersByTag.filter((item) => item.id === selectedTag);

  return {
    buyersByTag,
    totalNewUsers: fakeUsers.filter((user) => user.validatedAt !== null).length,
    totalBuyers: selectedTag === "all_tags" ? new Set(fakeConfirmedTickets.map((ticket) => ticket.orderId)).size : (buyersByTag[0]?.value ?? 0),
    isLoading: false,
    error: null,
  };
};

export { useNewVisitors, fakeBuyersByTag, fakeBuyer };
