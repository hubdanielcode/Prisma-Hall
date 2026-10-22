import { fakeReview } from "@/storybook/mocks/hooks/events/useReviews";
import { fn } from "storybook/test";
import { ProfileReviewsActions } from "./ProfileReviewsActions";

export default {
  title: "Layouts/Protected/Profile/Actions",
  component: ProfileReviewsActions,
  parameters: {
    layout: "fullscreen",
  },
};

const WithinEditWindow = () => {
  /* - Avaliação criada agora: o botão de editar aparece e some sozinho depois do prazo - */

  const freshReview = { ...fakeReview, createdAt: new Date().toISOString() };

  return (
    <div className="flex bg-[#1A1A1A] text-white font-semibold min-h-screen p-10">
      <ProfileReviewsActions
        review={freshReview}
        onEdit={fn()}
        onDelete={fn()}
      />
    </div>
  );
};

export { WithinEditWindow as "Profile Review Actions" };
