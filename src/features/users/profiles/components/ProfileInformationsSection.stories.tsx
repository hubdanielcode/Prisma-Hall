import { ProfileInformationsSection } from "./ProfileInformationsSection";
import { AuthenticationContext } from "@/features/authentication";
import { ProfileContext } from "../context/ProfileContext";
import { fn } from "storybook/test";

export default {
  title: "Layouts/Protected/Profile",
  component: ProfileInformationsSection,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const ProfileInformationTab = () => {
  /* - Criando um usuário falso e um perfil preenchido para não cair no FirstTimeModal - */

  const fakeUser = {
    id: "id-do-usuário-fake",
    name: "Maria Aparecida da Silva Sauro",
    email: "mariadinossaura.aparecida@gmail.com",
    role: "user" as const,
  };

  const fakeProfile = {
    name: "Maria Aparecida da Silva Sauro",
    profilePicture: null,
    phoneNumber: "(21) 98765-4321",
    role: "user" as const,
    verifiedBadge: true,
    createdAt: new Date("2026-01-10"),
    validatedAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-03-15"),
    socialSecurityNumber: "038.413.677-44",
    birthDate: new Date("1995-08-14"),
    zipCode: "25500-070",
    city: "São João de Meriti",
    state: "RJ",
    neighborhood: "Vilar dos Teles",
    street: "Rua das Acácias",
    number: "123",
    complement: "Apto 2102",
  };

  const ProfileInformationTabContent = () => {
    return (
      <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
        <ProfileInformationsSection />
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
          profile: fakeProfile,
          error: null,
          updateProfileMutation: fn(async () => true),
          deleteProfileMutation: fn(async () => true),
        }}
      >
        <ProfileInformationTabContent />
      </ProfileContext.Provider>
    </AuthenticationContext.Provider>
  );
};

export { ProfileInformationTab as "Profile Information Section" };
