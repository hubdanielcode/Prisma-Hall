import { AuthenticationProvider } from "@/features/authentication";
import { EditProfileModal } from "./EditProfileModal";
import { ProfileProvider } from "../context/ProfileContext";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: EditProfileModal,
};

const EditModal = () => {
  return (
    <AuthenticationProvider>
      <ProfileProvider>
        <EditProfileModal
          onClose={() => {}}
          isOpen
        />
        ;
      </ProfileProvider>
    </AuthenticationProvider>
  );
};

export { EditModal as "Edit Profile Modal" };
