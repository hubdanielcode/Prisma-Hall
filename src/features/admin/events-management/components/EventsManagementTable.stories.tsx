import { CalendarProvider } from "@/features/events";
import { EventsManagementTable } from "./EventsManagementTable";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Events Management/Table",
  component: EventsManagementTable,
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
