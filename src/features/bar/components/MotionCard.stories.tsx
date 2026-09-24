import { fakeProduct } from "../../../../.storybook/mocks/useProducts";
import { MotionCard } from "./MotionCard";

export default {
  title: "Layouts/Public/Bar",
  component: MotionCard,
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
