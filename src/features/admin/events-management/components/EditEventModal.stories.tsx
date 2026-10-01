import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { EditEventModal } from "./EditEventModal";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: EditEventModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CalendarProvider>
          <EventProvider>
            <EditEventModal
              isOpen={true}
              onClose={() => {}}
            />
          </EventProvider>
        </CalendarProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Event Modal" };
