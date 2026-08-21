import { MobileProvider } from "@/shared";
import { EventsManagementCard } from "./EventsManagementCard";

export default {
  title: "Admin/Admin Page/Events Management",
  component: EventsManagementCard,
};

const EventCards = () => {
  return (
    <MobileProvider>
      <EventsManagementCard />
    </MobileProvider>
  );
};

export { EventCards as Cards };
