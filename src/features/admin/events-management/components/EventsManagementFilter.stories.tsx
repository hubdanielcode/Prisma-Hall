import { MobileProvider } from "@/shared";
import { EventsManagementFilter } from "./EventsManagementFilter";

export default {
  title: "Layouts/Admin/Events Management",
  component: EventsManagementFilter,
};

const EventFilter = () => {
  return (
    <MobileProvider>
      <EventsManagementFilter />
    </MobileProvider>
  );
};

export { EventFilter as "Events Filter" };
