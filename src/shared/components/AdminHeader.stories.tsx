import { AdminHeader } from "@/shared/components/AdminHeader";
import { MobileProvider } from "../context/MobileContext";
import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { useEffect } from "react";
import "../../app/globals.css";

export default {
  title: "Layouts/Admin",
  component: AdminHeader,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const AdminPageHeader = () => {
  const AuthenticationContextConsumer = () => {
    const { isAuthenticated, setIsAuthenticated } = useAuthenticationContext();

    useEffect(() => {
      if (!isAuthenticated) {
        setIsAuthenticated(true);
      }
    }, []);

    return (
      <AdminHeader
        activeTab=""
        setActiveTab={() => {}}
      />
    );
  };

  return (
    <AuthenticationProvider>
      <MobileProvider>
        <AuthenticationContextConsumer />
      </MobileProvider>
    </AuthenticationProvider>
  );
};

export { AdminPageHeader as "Admin Page Header" };
