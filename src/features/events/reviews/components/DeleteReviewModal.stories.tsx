import { DeleteReviewModal } from "./DeleteReviewModal";
import { fakeReview } from "@/storybook/mocks/hooks/events/useReviews";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: DeleteReviewModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <DeleteReviewModal
          isOpen={true}
          onClose={() => {}}
          review={fakeReview}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Review Modal" };
