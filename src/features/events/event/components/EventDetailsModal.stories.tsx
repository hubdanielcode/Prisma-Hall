import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { EventDetailsModal } from "./EventDetailsModal";
import { fakeEvents } from "@/storybook/mocks/hooks/events/useEvents";
import { QueryProvider } from "@/shared/providers/QueryProvider";

/* - Evento que ainda vai acontecer, que é o único que mostra o botão de favoritar - */

const soonEvent = fakeEvents[4];

export default {
  title: "Layouts/Public/Schedule/Events",
  component: EventDetailsModal,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Modal = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <EventDetailsModal
            event={soonEvent}
            isOpen={true}
            onClose={() => {}}
          />
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Modal as "Event Details Modal" };
