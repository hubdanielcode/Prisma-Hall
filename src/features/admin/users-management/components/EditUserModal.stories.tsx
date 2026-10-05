import { EditUserModal } from "./EditUserModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { UserProvider } from "@/features/users/user/context/UserContext";

export default {
  title: "Layouts/Admin/Users Management/Modals",
  component: EditUserModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <UserProvider>
        <MobileProvider>
          <EditUserModal
            isOpen={true}
            onClose={() => {}}
          />
        </MobileProvider>
      </UserProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit User Modal" };
