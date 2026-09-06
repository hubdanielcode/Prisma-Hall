import { FirstTimeProfileModal } from "./FirstTimeProfileModal";
import { ProfileProvider } from "../context/ProfileContext";
import { AuthenticationProvider } from "@/features/authentication";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: FirstTimeProfileModal,
};

const FirstTimeModal = () => {
  return (
    <AuthenticationProvider>
      <ProfileProvider>
        <FirstTimeProfileModal
          onClose={() => {}}
          isOpen
        />
      </ProfileProvider>
    </AuthenticationProvider>
  );
};

export { FirstTimeModal as "First Time Modal" };
