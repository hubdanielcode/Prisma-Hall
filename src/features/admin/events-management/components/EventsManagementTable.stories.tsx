import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { EventsManagementTable } from "./EventsManagementTable";
import { MobileProvider } from "@/shared/context/MobileContext";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsManagementTable,
  parameters: {
    layout: "fullscreen",
  },
};

const TableData = () => {
  return (
    <CalendarProvider>
      <MobileProvider>
        <EventsManagementTable />
      </MobileProvider>
    </CalendarProvider>
  );
};

export { TableData as "Events Table Data" };
