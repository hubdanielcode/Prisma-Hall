import { EventCard } from "./EventCard";
import { fakeEvent } from "../../../../../.storybook/mocks/hooks/events/useEvents";

export default {
  title: "Layouts/Public/Home Page/Events",
  component: EventCard,
  parameters: {
    layout: "fullscreen",
  },
};

const Card = () => {
  return (
    <EventCard
      event={fakeEvent}
      index={0}
      footer={
        <div className="flex w-full items-center justify-between pt-4">
          <span className="text-white/60 text-sm font-semibold">A partir de</span>

          <span className="text-xl text-[#B8860B] font-bold">R$ {fakeEvent.price.toFixed(2).replace(".", ",")}</span>
        </div>
      }
    />
  );
};

export { Card as "Event Card" };
