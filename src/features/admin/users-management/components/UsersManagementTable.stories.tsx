import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { UserProvider } from "@/features/users/user/context/UserContext";
import { UsersManagementTable } from "./UsersManagementTable";

export default {
  title: "Layouts/Admin/Users Management/Table",
  component: UsersManagementTable,
  parameters: {
    layout: "fullscreen",
  },
};

const TableData = () => {
  return (
    <QueryProvider>
      <UserProvider>
        <MobileProvider>
          <UsersManagementTable
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </UserProvider>
    </QueryProvider>
  );
};

export { TableData as "Users Table Data" };
