import { CalendarProvider } from "@/features/events";
import { CreateEventModal } from "@/features/admin/events-management/components/CreateEventModal";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: CreateEventModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CalendarProvider>
          <EventProvider>
            <CreateEventModal
              isOpen={true}
              onClose={() => {}}
            />
          </EventProvider>
        </CalendarProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { CreateModal as "Create Event Modal" };
