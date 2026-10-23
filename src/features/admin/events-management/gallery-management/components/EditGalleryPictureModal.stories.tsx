import { EditGalleryPictureModal } from "./EditGalleryPictureModal";
import { fakePictures } from "@/storybook/mocks/hooks/events/gallery/useGallery";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Gallery Modals",
  component: EditGalleryPictureModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <EditGalleryPictureModal
          isOpen={true}
          onClose={() => {}}
          picture={fakePictures[0]}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Gallery Picture Modal" };
