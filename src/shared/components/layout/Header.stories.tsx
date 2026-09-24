import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { Header } from "./Header";
import { MobileProvider } from "../../context/MobileContext";
import { QueryProvider } from "../../providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page",
  component: Header,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const GeneralPageHeader = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <MobileProvider>
            <Header />
          </MobileProvider>
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { GeneralPageHeader as "General Page Header" };
