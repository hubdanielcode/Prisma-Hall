import { DeleteGalleryPictureModal } from "./DeleteGalleryPictureModal";
import { fakePictures } from "@/storybook/mocks/hooks/events/gallery/useGallery";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Events Management/Gallery Modals",
  component: DeleteGalleryPictureModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <DeleteGalleryPictureModal
          isOpen={true}
          onClose={() => {}}
          picture={fakePictures[0]}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Gallery Picture Modal" };
