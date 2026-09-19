import { QueryProvider } from "@/shared/providers/QueryProvider";
import { EditProfileModal } from "./EditProfileModal";
import { ProfileProvider } from "../context/ProfileContext";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: EditProfileModal,
};

const EditModal = () => {
  return (
    <QueryProvider>
      <ProfileProvider>
        <EditProfileModal
          onClose={() => {}}
          isOpen
        />
      </ProfileProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Profile Modal" };
