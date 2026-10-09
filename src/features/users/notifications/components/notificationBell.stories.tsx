import { AuthenticationContext } from "@/features/authentication/context/AuthenticationContext";
import { fakeUser } from "../../../../../.storybook/mocks/hooks/users/useUsers";
import { fn } from "storybook/test";
import { NotificationBell } from "./NotificationBell";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected",
  component: NotificationBell,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Bell = () => {
  /* - Usando um usuário falso. Sem isso, o useNotifications não habilita a busca de notificações - */

  return (
    <QueryProvider>
      <AuthenticationContext.Provider
        value={{
          isLoading: false,
          isAuthenticated: true,
          user: fakeUser,
          error: null,
          revokeSessionMutation: fn(async () => true),
        }}
      >
        <div className="flex items-start justify-start bg-[#1A1A1A] h-screen w-full px-70 py-15">
          <NotificationBell />
        </div>
      </AuthenticationContext.Provider>
    </QueryProvider>
  );
};

export { Bell as "Notification Bell" };
