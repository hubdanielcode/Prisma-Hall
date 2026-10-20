import { CancelEventModal } from "./CancelEventModal";
import { EventProvider } from "@/features/events/event/context/EventContext";
import { fakeEvent } from "@/storybook/mocks/hooks/events/useEvents";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Event Modals",
  component: CancelEventModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CancelModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <EventProvider>
          <CancelEventModal
            isOpen={true}
            onClose={() => {}}
            event={fakeEvent}
          />
        </EventProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { CancelModal as "Cancel Event Modal" };
