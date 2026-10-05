import { AuthenticationContext } from "@/features/authentication/context/AuthenticationContext";
import { fn } from "storybook/test";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProfileOrdersSection } from "./ProfileOrdersSection";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Sections",
  component: ProfileOrdersSection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfileOrdersTab = () => {
  /* - Criando um usuário falso. Sem isso, o useTickets não habilita a busca de ingressos - */

  const fakeUser = {
    id: "id-do-usuário-fake",
    name: "Maria Aparecida da Silva Sauro",
    email: "mariadinossaura.aparecida@gmail.com",
    role: "user" as const,
  };

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
        <MobileProvider>
          <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
            <ProfileOrdersSection />
          </div>
        </MobileProvider>
      </AuthenticationContext.Provider>
    </QueryProvider>
  );
};

export { ProfileOrdersTab as "Profile Orders Section" };
