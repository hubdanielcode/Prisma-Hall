import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { EventsManagementCard } from "./EventsManagementCard";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

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
