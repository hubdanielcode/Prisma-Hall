import { Route } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/features/authentication";
import {
  About,
  FrequentlyAskedQuestions,
  HelpingCentral,
  PrivacyPolicy,
  TermsOfUse,
} from "@/shared";

type FooterRoutesProps = {
  session: Session | null;
};

const FooterRoutes = ({ session }: FooterRoutesProps) => {
  return (
    <>
      {/* - Rotas públicas: Não precisa de sessão ativa para acessar! - */}

      {/* - Rota de termos de uso - */}

      <Route
        path="/termos-de-uso"
        element={<TermsOfUse />}
      />

      {/* - Rota de políticas de privacidade - */}

      <Route
        path="/politicas-de-privacidade"
        element={<PrivacyPolicy />}
      />

      {/* - Rotas protegidas: Precisa de sessão ativa para acessar! - */}

      <Route element={<ProtectedRoute session={session} />}>
        {/* - Rota de central de ajuda - */}

        <Route
          path="/central-de-ajuda"
          element={<HelpingCentral />}
        />

        {/* - Rota de sobre nós - */}

        <Route
          path="/sobre"
          element={<About />}
        />

        {/* - Rota de perguntas frequentes - */}

        <Route
          path="/perguntas-frequentes"
          element={<FrequentlyAskedQuestions />}
        />
      </Route>
    </>
  );
};

export { FooterRoutes };
