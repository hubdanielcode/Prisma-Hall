import { DeleteEventModal } from "./DeleteEventModal";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { fakeEvent } from "../../../../../.storybook/mocks/hooks/useEvents";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: DeleteEventModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <EventProvider>
          <DeleteEventModal
            isOpen={true}
            onClose={() => {}}
            event={fakeEvent}
          />
        </EventProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Event Modal" };
