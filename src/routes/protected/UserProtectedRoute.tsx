import { Outlet, Navigate } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";

const UserProtectedRoute = ({ session }: { session: Session | null }) => {
  if (!session) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export { UserProtectedRoute };
