import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { EventsManagementTable } from "./EventsManagementTable";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsManagementTable,
  parameters: {
    layout: "fullscreen",
  },
};

const TableData = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CalendarProvider>
          <EventProvider>
            <EventsManagementTable
              currentPage={1}
              onPageChange={() => {}}
            />
          </EventProvider>
        </CalendarProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { TableData as "Events Table Data" };
