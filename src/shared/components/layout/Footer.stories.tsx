import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { CartProvider } from "@/features/cart/context/CartContext";
import { Footer } from "@/shared/components/layout/Footer";
import { MobileProvider } from "../../context/MobileContext";
import { useEffect } from "react";

export default {
  title: "Components/Shared",
  component: Footer,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const GeneralFooter = () => {
  const AuthenticationContextConsumer = () => {
    const { isAuthenticated, setIsAuthenticated } = useAuthenticationContext();

    useEffect(() => {
      if (!isAuthenticated) {
        setIsAuthenticated(true);
      }
    }, [isAuthenticated, setIsAuthenticated]);

    return <Footer />;
  };

  return (
    <AuthenticationProvider>
      <CartProvider>
        <MobileProvider>
          <AuthenticationContextConsumer />
        </MobileProvider>
      </CartProvider>
    </AuthenticationProvider>
  );
};

export { GeneralFooter as "Footer" };
