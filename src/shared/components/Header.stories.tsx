import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { Header } from "./Header";
import { MobileProvider } from "../context/MobileContext";
import { useEffect } from "react";
import { CartProvider } from "@/features/cart";
import "../../app/globals.css";

export default {
  title: "Layouts/Public/Home Page",
  component: Header,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const GeneralPageHeader = () => {
  const AuthenticationContextConsumer = () => {
    const { isAuthenticated, setIsAuthenticated } = useAuthenticationContext();

    useEffect(() => {
      if (!isAuthenticated) {
        setIsAuthenticated(true);
      }
    }, [isAuthenticated, setIsAuthenticated]);

    return <Header />;
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

export { GeneralPageHeader as "General Page Header" };
