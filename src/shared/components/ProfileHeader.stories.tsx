import { AuthenticationProvider, useAuthenticationContext } from "@/features/authentication";
import { ProfileHeader } from "./ProfileHeader";
import { MobileProvider } from "../context/MobileContext";
import { MemoryRouter } from "react-router-dom";
import { useEffect } from "react";

export default {
  title: "Admin/Profile Page",
  component: ProfileHeader,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfilePageHeader = () => {
  const AuthenticationContextConsumer = () => {
    const { isAuthenticated, setIsAuthenticated } = useAuthenticationContext();

    useEffect(() => {
      if (!isAuthenticated) {
        setIsAuthenticated(true);
      }
    }, []);

    return (
      <ProfileHeader
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

export { ProfilePageHeader as "Profile Page Header" };
