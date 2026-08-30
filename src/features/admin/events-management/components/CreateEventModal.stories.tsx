import { CreateEventModal } from "@/features/admin/events-management/components/CreateEventModal";
import { CalendarProvider } from "@/features/events";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: CreateEventModal,
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
