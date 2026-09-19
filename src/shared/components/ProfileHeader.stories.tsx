import { AuthenticationProvider } from "@/features/authentication";
import { MobileProvider, ProfileHeader } from "@/shared/index";
import { ProfileProvider } from "@/features/users";
import { QueryProvider } from "../providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile",
  component: ProfileHeader,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfilePageHeader = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <MobileProvider>
          <ProfileProvider>
            <ProfileHeader
              activeTab=""
              setActiveTab={() => {}}
            />
          </ProfileProvider>
        </MobileProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { ProfilePageHeader as "Profile Page Header" };
