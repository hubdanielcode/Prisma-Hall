import { MobileProvider } from "@/shared/context/MobileContext";
import { EventsManagementCard } from "./EventsManagementCard";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { CalendarProvider } from "@/features/events/agenda";

export default {
  title: "Layouts/Admin/Events Management",
  component: EventsManagementCard,
};

const EventCards = () => {
  return (
    <QueryProvider>
      <CalendarProvider>
        <MobileProvider>
          <EventsManagementCard />
        </MobileProvider>
      </CalendarProvider>
    </QueryProvider>
  );
};

export { EventCards as "Events Cards" };
