import { DeleteEventModal } from "./DeleteEventModal";
import { CalendarProvider } from "@/features/events";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Events Management/Modals",
  component: DeleteEventModal,
};

const DeleteModal = () => {
  <MobileProvider>
    <CalendarProvider>
      <DeleteEventModal
        isOpen={true}
        onClose={() => {}}
      />
    </CalendarProvider>
  </MobileProvider>;
};

export { DeleteModal as "Delete Event Modal" };
