export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  verifiedBadge: boolean;
  oldUser: "none" | "bronze" | "silver" | "gold";
  frequentUser: "none" | "bronze" | "silver" | "gold";
  profilePicture: string | null;
  validatedAt: string | null;

  createdAt: string;
  updatedAt: string;
}
