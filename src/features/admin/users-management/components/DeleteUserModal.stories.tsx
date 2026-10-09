import { DeleteUserModal } from "./DeleteUserModal";
import { fakeUser } from "../../../../../.storybook/mocks/hooks/users/useUsers";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { UserProvider } from "@/features/users/user/context/UserContext";

export default {
  title: "Layouts/Admin/Users Management/Modals",
  component: DeleteUserModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <UserProvider>
          <DeleteUserModal
            isOpen={true}
            onClose={() => {}}
            user={fakeUser}
          />
        </UserProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete User Modal" };
