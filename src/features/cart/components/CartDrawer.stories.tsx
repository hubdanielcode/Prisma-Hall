import { CartDrawer } from "./CartDrawer";
import { CartProvider } from "@/features/cart/context/CartContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Cart",
  component: CartDrawer,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Drawer = () => {
  return (
    <QueryProvider>
      <CartProvider>
        <CartDrawer
          isOpen={true}
          onClose={() => {}}
        />
      </CartProvider>
    </QueryProvider>
  );
};

export { Drawer as "Cart Drawer" };
