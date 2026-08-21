import { Route } from "react-router-dom";
import {
  Authentication,
  Login,
  RecoverPassword,
} from "@/features/authentication";

const AuthenticationRoutes = () => {
  return (
    <>
      {/* - Rotas públicas: não precisa de sessão ativa para acessar! - */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Authentication />}
      />

      <Route
        path="/recuperar-senha"
        element={<RecoverPassword />}
      />
    </>
  );
};

export { AuthenticationRoutes };
