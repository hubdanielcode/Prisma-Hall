import { MobileProvider } from "@/shared";
import { EventsManagementCard } from "./EventsManagementCard";

export default {
  title: "Layouts/Admin/Events Management",
  component: EventsManagementCard,
};

const EventCards = () => {
  return (
    <MobileProvider>
      <EventsManagementCard />
    </MobileProvider>
  );
};

export { EventCards as "Events Cards" };
