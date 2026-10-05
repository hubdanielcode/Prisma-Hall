import { AttractionProvider } from "@/features/events/event/context/AttractionContext";
import { EditAttractionModal } from "./EditAttractionModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Attraction Modals",
  component: EditAttractionModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <AttractionProvider>
          <EditAttractionModal
            isOpen={true}
            onClose={() => {}}
          />
        </AttractionProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Attraction Modal" };
