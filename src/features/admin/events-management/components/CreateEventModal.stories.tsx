import { CalendarProvider, EventProvider } from "@/features/events";
import { CreateEventModal } from "./CreateEventModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Event Modals",
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
