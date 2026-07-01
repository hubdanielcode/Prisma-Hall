import { type Session } from "@supabase/supabase-js";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = ({
  session,
  user_role,
}: {
  session: Session | null;
  user_role: "user" | "admin";
}) => {
  if (!session || user_role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export { AdminProtectedRoute };
