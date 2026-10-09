import { AttractionProvider } from "@/features/events/event/context/AttractionContext";
import { DeleteAttractionModal } from "./DeleteAttractionModal";
import { fakeAttraction } from "../../../../../.storybook/mocks/hooks/events/useAttractions";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Attraction Modals",
  component: DeleteAttractionModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <AttractionProvider>
          <DeleteAttractionModal
            isOpen={true}
            onClose={() => {}}
            attraction={fakeAttraction}
          />
        </AttractionProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Attraction Modal" };
