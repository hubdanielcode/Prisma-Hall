import { Route } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { UserProtectedRoute } from "../protected/UserProtectedRoute";
import { type ComponentType } from "react";
import { MainContent, Missing } from "@/shared";
import { Schedule } from "@/features/events/agenda/pages/Schedule";
import { ProfilePage } from "@/features/users/profiles/pages/ProfilePage";

interface GeneralRoutesProps {
  session: Session | null;
  AppLayout: ComponentType;
}

const GeneralRoutes = ({ session, AppLayout }: GeneralRoutesProps) => {
  return (
    <>
      {/* - Rotas públicas: não precisa de sessão ativa para acessar! - */}

      <Route
        path="/"
        element={<AppLayout />}
      >
        <Route
          index
          element={<MainContent />}
        />

        <Route
          path="/agenda"
          element={<Schedule />}
        />
      </Route>

      <Route
        path="*"
        element={<Missing />}
      />

      {/* - Rotas protegidas: precisa de sessão ativa para acessar! - */}

      <Route element={<UserProtectedRoute session={session} />}>
        <Route
          path="/"
          element={<AppLayout />}
        >
          <Route
            path="/perfil"
            element={<ProfilePage />}
          />
        </Route>
      </Route>
    </>
  );
};

export { GeneralRoutes };
