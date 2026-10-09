import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { EventModal } from "./EventModal";
import { fakeEvent } from "../../../../../.storybook/mocks/hooks/events/useEvents";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Schedule/Events",
  component: EventModal,
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
          <EventModal
            event={fakeEvent}
            isOpen={true}
            onClose={() => {}}
          />
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Modal as "Event Modal" };
