import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { CartProvider } from "@/features/cart";
import { Header } from "./Header";
import { MobileProvider } from "../context/MobileContext";
import { QueryProvider } from "../providers/QueryProvider";
import { useEffect } from "react";

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
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <MobileProvider>
            <AuthenticationContextConsumer />
          </MobileProvider>
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { GeneralPageHeader as "General Page Header" };
