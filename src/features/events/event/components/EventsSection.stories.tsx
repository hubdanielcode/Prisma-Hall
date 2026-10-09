import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { EventsSection } from "./EventsSection";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page/Events",
  component: EventsSection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Section = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <EventsSection />
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Section as "Events Section" };
