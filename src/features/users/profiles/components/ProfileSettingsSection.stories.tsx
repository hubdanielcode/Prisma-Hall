import { AuthenticationContext } from "@/features/authentication/context/AuthenticationContext";
import { fn } from "storybook/test";
import { ProfileContext } from "../context/ProfileContext";
import { ProfileSettingsSection } from "./ProfileSettingsSection";

export default {
  title: "Layouts/Protected/Profile/Sections",
  component: ProfileSettingsSection,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfileSettingsTab = () => {
  /* - Criando um usuário falso. Sem isso, não tem como deletar a conta, ativar notificações ou trocar senha - */

  const fakeUser = {
    id: "id-do-usuário-fake",
    name: "Maria Aparecida da Silva Sauro",
    email: "mariadinossaura.aparecida@gmail.com",
    role: "user" as const,
  };

  const ProfileSettingsTabContent = () => {
    return (
      <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
        <ProfileSettingsSection />
      </div>
    );
  };

  return (
    <AuthenticationContext.Provider
      value={{
        isLoading: false,
        isAuthenticated: true,
        user: fakeUser,
        error: null,
        revokeSessionMutation: fn(async () => true),
      }}
    >
      <ProfileContext.Provider
        value={{
          isLoading: false,
          profile: undefined,
          error: null,
          updateProfileMutation: fn(async () => true),
          deleteProfileMutation: fn(async () => false),
        }}
      >
        <ProfileSettingsTabContent />
      </ProfileContext.Provider>
    </AuthenticationContext.Provider>
  );
};

export { ProfileSettingsTab as "Profile Settings Section" };
