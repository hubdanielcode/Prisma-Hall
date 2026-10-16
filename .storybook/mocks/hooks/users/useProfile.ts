import { fn } from "storybook/test";
import type { ProfileProps } from "@/features/authentication/types/profile";

const fakeProfile: ProfileProps = {
  name: "Maria Aparecida da Silva Sauro",
  profilePicture: null,
  phoneNumber: "(21) 98765-4321",
  role: "user",
  verifiedBadge: true,
  oldUser: "silver",
  frequentUser: "gold",
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

const useProfile = () => ({
  profile: fakeProfile,
  isLoading: false,
  error: null,
  updateProfileMutation: fn(),
  deleteProfileMutation: fn(),
});

export { useProfile, fakeProfile };
