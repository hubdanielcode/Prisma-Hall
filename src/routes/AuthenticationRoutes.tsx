import { Route } from "react-router-dom";
import {
  Authentication,
  Login,
  RecoverPassword,
} from "@/features/authentication";

const AuthenticationRoutes = () => {
  return (
    <>
      {/* - Rotas públicas: Não precisa de sessão ativa para acessar! - */}

      {/* - Rota de login  - */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* - Rota de cadastro - */}

      <Route
        path="/cadastro"
        element={<Authentication />}
      />

      {/* - Rota de recuperação de senha - */}

      <Route
        path="/recuperar-senha"
        element={<RecoverPassword />}
      />
    </>
  );
};

export { AuthenticationRoutes };
