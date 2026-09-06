import { ProfileProvider } from "@/features/users";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProfileHeader } from "@/shared/components/ProfileHeader";
import { AuthenticationProvider } from "@/features/authentication";

export default {
  title: "Layouts/Protected/Profile",
  component: ProfileHeader,
};

const ProfilePageHeader = () => {
  return (
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
  );
};

export { ProfilePageHeader as "Profile Page Header" };
