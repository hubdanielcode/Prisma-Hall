import { UserRole } from "@/prisma/generated/prisma/enums";

export type SessionUserProps = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
