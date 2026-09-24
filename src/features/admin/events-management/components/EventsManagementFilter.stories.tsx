import { MobileProvider } from "@/shared/context/MobileContext";
import { EventsManagementFilter } from "./EventsManagementFilter";

export default {
  title: "Layouts/Admin/Events Management",
  component: EventsManagementFilter,
  parameters: {
    layout: "fullscreen",
  },
};

const EventFilter = () => {
  return (
    <MobileProvider>
      <EventsManagementFilter />
    </MobileProvider>
  );
};

export { EventFilter as "Events Filter" };
