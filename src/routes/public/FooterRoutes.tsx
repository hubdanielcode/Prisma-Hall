import { Route } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { UserProtectedRoute } from "../protected/UserProtectedRoute";
import {
  About,
  FrequentlyAskedQuestions,
  HelpingCentral,
  PrivacyPolicy,
  TermsOfUse,
} from "@/shared";

interface FooterRoutesProps {
  session: Session | null;
}

const FooterRoutes = ({ session }: FooterRoutesProps) => {
  return (
    <>
      {/* - Rotas públicas: não precisa de sessão ativa para acessar! - */}

      <Route
        path="/termos-de-uso"
        element={<TermsOfUse />}
      />

      <Route
        path="/politicas-de-privacidade"
        element={<PrivacyPolicy />}
      />

      {/* - Rotas protegidas: precisa de sessão ativa para acessar! - */}

      <Route element={<UserProtectedRoute session={session} />}>
        <Route
          path="/central-de-ajuda"
          element={<HelpingCentral />}
        />

        <Route
          path="/sobre"
          element={<About />}
        />

        <Route
          path="/perguntas-frequentes"
          element={<FrequentlyAskedQuestions />}
        />
      </Route>
    </>
  );
};

export { FooterRoutes };
