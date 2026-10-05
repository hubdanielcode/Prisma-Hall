import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { UserProvider } from "@/features/users/user/context/UserContext";
import { UsersManagementFilter } from "./UsersManagementFilter";

export default {
  title: "Layouts/Admin/Users Management",
  component: UsersManagementFilter,
  parameters: {
    layout: "fullscreen",
  },
};

const UserFilter = () => {
  return (
    <QueryProvider>
      <UserProvider>
        <MobileProvider>
          <UsersManagementFilter
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </UserProvider>
    </QueryProvider>
  );
};

export { UserFilter as "Users Filter" };
