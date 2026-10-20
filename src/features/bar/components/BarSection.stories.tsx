import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { BarProvider } from "../context/BarContext";
import { BarSection } from "./BarSection";
import { CartProvider } from "@/features/cart/context/CartContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page/Bar",
  component: BarSection,
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
        <BarProvider>
          <CartProvider>
            <BarSection />
          </CartProvider>
        </BarProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Section as "Bar Section" };
