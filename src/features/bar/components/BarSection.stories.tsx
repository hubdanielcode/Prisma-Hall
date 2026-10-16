import { BarProvider } from "@/features/bar/context/BarContext";
import { BarSection } from "./BarSection";
import { CartProvider } from "@/features/cart/context/CartContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AuthenticationProvider } from "@/features/authentication";

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
