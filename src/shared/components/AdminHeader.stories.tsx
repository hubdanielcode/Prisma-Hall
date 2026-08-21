import { AdminHeader } from "@/shared/components/AdminHeader";
import { MobileProvider } from "../context/MobileContext";
import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { MemoryRouter } from "react-router-dom";
import { useEffect } from "react";

export default {
  title: "Admin/Admin Page",
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
    <MemoryRouter>
      <AuthenticationProvider>
        <MobileProvider>
          <AuthenticationContextConsumer />
        </MobileProvider>
      </AuthenticationProvider>
    </MemoryRouter>
  );
};

export { AdminPageHeader as "Admin Page Header" };
