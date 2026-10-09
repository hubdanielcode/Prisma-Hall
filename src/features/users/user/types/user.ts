import { UserBadgeLevel, UserRole } from "@/prisma/generated/prisma/enums";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verifiedBadge: boolean;
  oldUser: UserBadgeLevel;
  frequentUser: UserBadgeLevel;
  profilePicture: string | null;
  validatedAt: string | null;

  createdAt: string;
  updatedAt: string;
}
