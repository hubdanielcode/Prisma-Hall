import { EditEventModal } from "./EditEventModal";
import { CalendarProvider } from "@/features/events";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: EditEventModal,
};

const EditModal = () => {
  <MobileProvider>
    <CalendarProvider>
      <EditEventModal
        isOpen={true}
        onClose={() => {}}
      />
    </CalendarProvider>
  </MobileProvider>;
};

export { EditModal as "Edit Event Modal" };
