import { FirstTimeProfileModal } from "./FirstTimeProfileModal";
import { ProfileProvider } from "../context/ProfileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Modals",
  component: FirstTimeProfileModal,
};

const FirstTimeModal = () => {
  return (
    <QueryProvider>
      <ProfileProvider>
        <FirstTimeProfileModal
          onClose={() => {}}
          isOpen
        />
      </ProfileProvider>
    </QueryProvider>
  );
};

export { FirstTimeModal as "First Time Modal" };
