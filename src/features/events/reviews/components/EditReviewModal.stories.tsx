import { EditReviewModal } from "./EditReviewModal";
import { fakeReview } from "@/storybook/mocks/hooks/events/useReviews";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: EditReviewModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <EditReviewModal
          isOpen={true}
          onClose={() => {}}
          review={fakeReview}
        />
      </MobileProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Review Modal" };
