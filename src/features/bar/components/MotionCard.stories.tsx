import { MotionCard } from "./MotionCard";

export default {
  title: "Layouts/Public/Bar",
  component: MotionCard,
};

const Card = () => {
  return (
    <MotionCard
      index={0}
      children
    />
  );
};

export { Card as "Motion Card" };
