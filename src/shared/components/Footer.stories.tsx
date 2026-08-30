import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { Footer } from "@/shared/components/Footer";
import { useEffect } from "react";
import { CartProvider } from "@/features/cart";
import { MobileProvider } from "../context/MobileContext";

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
