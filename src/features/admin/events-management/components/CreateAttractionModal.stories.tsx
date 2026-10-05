import { CreateAttractionModal } from "./CreateAttractionModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AttractionProvider } from "@/features/events/event/context/AttractionContext";

export default {
  title: "Layouts/Admin/Events Management/Attraction Modals",
  component: CreateAttractionModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <AttractionProvider>
          <CreateAttractionModal
            isOpen={true}
            onClose={() => {}}
          />
        </AttractionProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { CreateModal as "Create Attraction Modal" };
