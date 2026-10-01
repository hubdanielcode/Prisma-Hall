import { CalendarProvider } from "@/features/events";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { EventsManagementFilter } from "./EventsManagementFilter";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management",
  component: EventsManagementFilter,
  parameters: {
    layout: "fullscreen",
  },
};

const EventFilter = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CalendarProvider>
          <EventProvider>
            <EventsManagementFilter
              currentPage={1}
              onPageChange={() => {}}
            />
          </EventProvider>
        </CalendarProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { EventFilter as "Events Filter" };
