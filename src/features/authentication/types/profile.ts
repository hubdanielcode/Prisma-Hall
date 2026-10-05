import { UserBadgeLevel } from "@/prisma/generated/prisma/enums";

export interface ProfileProps {
  name: string;
  profilePicture: string | null;
  phoneNumber?: string;
  role: "admin" | "user";
  verifiedBadge: boolean;
  oldUser: UserBadgeLevel;
  frequentUser: UserBadgeLevel;
  createdAt: Date;
  validatedAt: Date | null;
  updatedAt: Date;
  socialSecurityNumber?: string;
  birthDate?: Date;
  zipCode?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  complement?: string;
}
