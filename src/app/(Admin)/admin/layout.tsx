import { redirect } from "next/navigation";
import { validateSession } from "@/actions/session/validateSession";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const validatedSession = await validateSession();

  if (!validatedSession || validatedSession.user.role !== "admin") {
    redirect("/");
  }

  return <div>{children}</div>;
};

export default AdminLayout;
