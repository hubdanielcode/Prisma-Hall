import { AuthenticationContext } from "@/features/authentication/context/AuthenticationContext";
import { fakeUser } from "../../../../../.storybook/mocks/hooks/users/user/useUsers";
import { fn } from "storybook/test";
import { ProfileInformationsSection } from "./ProfileInformationsSection";
import { ProfileProvider } from "../context/ProfileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Sections",
  component: ProfileInformationsSection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfileInformationTab = () => {
  return (
    <QueryProvider>
      <AuthenticationContext.Provider
        value={{
          isLoading: false,
          isAuthenticated: true,
          user: fakeUser,
          error: null,
          revokeSessionMutation: fn(async () => true),
        }}
      >
        <ProfileProvider>
          <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
            <ProfileInformationsSection />
          </div>
        </ProfileProvider>
      </AuthenticationContext.Provider>
    </QueryProvider>
  );
};

export { ProfileInformationTab as "Profile Information Section" };
