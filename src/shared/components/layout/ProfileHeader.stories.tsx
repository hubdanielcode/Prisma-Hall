import { AuthenticationProvider } from "@/features/authentication";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProfileHeader } from "@/shared/components/layout/ProfileHeader";
import { ProfileProvider } from "@/features/users";
import { QueryProvider } from "../../providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile",
  component: ProfileHeader,
  parameters: {
    layout: "fullscreen",
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
