import type { Session } from "@supabase/supabase-js";
import type { ComponentType } from "react";
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "../protected/AdminProtectedRoute";
import { AdminPage } from "@/features/admin/bar-management/pages/AdminPage";

interface AdminRoutes {
  session: Session | null;
  user_role: "admin" | "user";
  AdminLayout: ComponentType;
}

const AdminRoutes = ({
  session,
  user_role: userRole,
  AdminLayout,
}: AdminRoutes) => {
  return (
    <>
      <Route
        element={
          <AdminProtectedRoute
            session={session}
            user_role={userRole}
          />
        }
      >
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<AdminPage />}
          />
        </Route>
      </Route>
    </>
  );
};

export { AdminRoutes };
