import { EditEventModal } from "./EditEventModal";
import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { MobileProvider } from "@/shared/context/MobileContext";

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
