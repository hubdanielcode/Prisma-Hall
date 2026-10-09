import { fakeProduct } from "../../../../.storybook/mocks/hooks/bar/useProducts";
import { MotionCard } from "./MotionCard";

export default {
  title: "Layouts/Public/Home Page/Bar",
  component: MotionCard,
  parameters: {
    layout: "fullscreen",
  },
};

const Card = () => {
  return (
    <MotionCard index={0}>
      <div className="flex flex-col p-4">
        <span className="text-white font-bold">{fakeProduct.name}</span>

        <span className="text-sm text-white/60 pt-2">{fakeProduct.description}</span>
      </div>
    </MotionCard>
  );
};

export { Card as "Motion Card" };
