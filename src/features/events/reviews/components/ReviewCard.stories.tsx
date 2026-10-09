import { fakeReview } from "../../../../../.storybook/mocks/hooks/events/useReviews";
import { ReviewCard } from "./ReviewCard";

export default {
  title: "Layouts/Public/Reviews",
  component: ReviewCard,
  parameters: {
    layout: "fullscreen",
  },
};

const Card = () => {
  return (
    <ReviewCard
      review={fakeReview}
      index={0}
    />
  );
};

export { Card as "Review Card" };
