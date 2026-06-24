import { Route } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/features/authentication";
import { type ComponentType } from "react";
import { MainContent, Missing } from "@/shared";
import { Schedule } from "@/features/events/agenda/pages/Schedule";
import { ProfilePage } from "@/features/users/profiles/pages/ProfilePage";

type GeneralRoutesProps = {
  session: Session | null;
  AppLayout: ComponentType;
};

const GeneralRoutes = ({ session, AppLayout }: GeneralRoutesProps) => {
  return (
    <>
      {/* - Rotas públicas: Não precisa de sessão ativa para acessar! - */}

      {/* - Rotas com header e footer predefinidos - */}

      <Route
        path="/"
        element={<AppLayout />}
      >
        {/* - Rota principal - */}

        <Route
          index
          element={<MainContent />}
        />

        {/* - Rota de agenda - */}

        <Route
          path="/agenda"
          element={<Schedule />}
        />
      </Route>

      {/* - Rota de erro - */}

      <Route
        path="*"
        element={<Missing />}
      />

      {/* - Rotas protegidas: Precisa de sessão ativa para acessar! - */}

      <Route element={<ProtectedRoute session={session} />}>
        {/* - Rotas com header e footer predefinidos - */}

        <Route
          path="/"
          element={<AppLayout />}
        />

        {/* - Rota de perfil - */}

        <Route
          path="/perfil"
          element={<ProfilePage />}
        />
      </Route>
    </>
  );
};

export { GeneralRoutes };
