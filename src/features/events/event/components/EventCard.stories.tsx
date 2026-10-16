import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { EventCard } from "./EventCard";
import { fakeEvents } from "../../../../../.storybook/mocks/hooks/events/useEvents";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page/Events",
  component: EventCard,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

/* - Evento que ainda vai acontecer, que é o único que mostra o botão de favoritar - */

const soonEvent = fakeEvents[4];

const Card = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <EventCard
          event={soonEvent}
          index={0}
          footer={
            <div className="flex w-full items-center justify-between pt-4">
              <span className="text-white/60 text-sm font-semibold">A partir de</span>

              <span className="text-xl text-[#B8860B] font-bold">R$ {soonEvent.price.toFixed(2).replace(".", ",")}</span>
            </div>
          }
        />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Card as "Event Card" };
