import { CreateGalleryPictureModal } from "./CreateGalleryPictureModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Gallery Modals",
  component: CreateGalleryPictureModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CreateGalleryPictureModal
          isOpen={true}
          onClose={() => {}}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { CreateModal as "Create Gallery Picture Modal" };
