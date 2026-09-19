export type SessionUserProps = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: "user" | "admin";
};
