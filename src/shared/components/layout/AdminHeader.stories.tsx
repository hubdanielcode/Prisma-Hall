import { AdminHeader } from "./AdminHeader";
import { AuthenticationProvider } from "@/features/authentication";
import { MobileProvider } from "../../context/MobileContext";
import { QueryProvider } from "../../providers/QueryProvider";

export default {
  title: "Layouts/Admin",
  component: AdminHeader,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const AdminPageHeader = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <MobileProvider>
          <AdminHeader
            activeTab="bar"
            setActiveTab={() => {}}
          />
        </MobileProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { AdminPageHeader as "Admin Page Header" };
