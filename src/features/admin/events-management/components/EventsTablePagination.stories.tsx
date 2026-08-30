import { CalendarProvider } from "@/features/events";
import { EventsTablePagination } from "./EventsTablePagination";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsTablePagination,
};

const TablePagination = () => {
  return (
    <CalendarProvider>
      <MobileProvider>
        <EventsTablePagination />
      </MobileProvider>
    </CalendarProvider>
  );
};

export { TablePagination as "Events Table Pagination" };
