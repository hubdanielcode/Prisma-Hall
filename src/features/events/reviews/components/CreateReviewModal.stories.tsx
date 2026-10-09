import { CreateReviewModal } from "./CreateReviewModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page/Reviews",
  component: CreateReviewModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <CreateReviewModal
          isOpen={true}
          onClose={() => {}}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { CreateModal as "Create Review Modal" };
