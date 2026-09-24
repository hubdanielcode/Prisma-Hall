import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { EventsTablePagination } from "./EventsTablePagination";
import { MobileProvider } from "@/shared/context/MobileContext";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsTablePagination,
  parameters: {
    layout: "fullscreen",
  },
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
