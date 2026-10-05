import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { UserProvider } from "@/features/users/user/context/UserContext";
import { UsersManagementCard } from "./UsersManagementCard";

export default {
  title: "Layouts/Admin/Users Management",
  component: UsersManagementCard,
  parameters: {
    layout: "fullscreen",
  },
};

const UserCards = () => {
  return (
    <QueryProvider>
      <UserProvider>
        <MobileProvider>
          <UsersManagementCard />
        </MobileProvider>
      </UserProvider>
    </QueryProvider>
  );
};

export { UserCards as "Users Cards" };
