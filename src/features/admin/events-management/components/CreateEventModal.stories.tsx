import { CreateEventModal } from "@/features/admin/events-management/components/CreateEventModal";
import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { MobileProvider } from "@/shared/context/MobileContext";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: CreateEventModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  <MobileProvider>
    <CalendarProvider>
      <CreateEventModal
        isOpen={true}
        onClose={() => {}}
      />
    </CalendarProvider>
  </MobileProvider>;
};

export { CreateModal as "Create Event Modal" };
