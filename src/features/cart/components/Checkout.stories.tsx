import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "../context/CartContext";
import { Checkout } from "./Checkout";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Cart",
  component: Checkout,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const CheckoutComponent = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { CheckoutComponent as "Cart Checkout" };
