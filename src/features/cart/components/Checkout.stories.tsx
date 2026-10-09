import { AuthenticationProvider } from "@/features/authentication";
import { CartProvider } from "@/features/cart/context/CartContext";
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
