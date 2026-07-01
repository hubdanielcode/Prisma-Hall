import { AppProviders } from "./providers/AppProviders";
import { Footer, Header } from "./shared";
import { motion } from "framer-motion";
import { Routes, Outlet, useNavigate } from "react-router-dom";
import { supabase, supabaseTemp } from "../supabase/supabase";
import { type AuthChangeEvent, type Session } from "@supabase/supabase-js";
import { useAuthenticationContext } from "./features/authentication";
import { useEffect, useState } from "react";
import { AuthenticationRoutes, FooterRoutes, GeneralRoutes } from "./routes";
import { AdminRoutes } from "./routes/public/AdminRoutes";

const AppContent = () => {
  /* - Puxando do context - */

  const { session, setSession, setIsAuthenticated } =
    useAuthenticationContext();

  /* - Estados do usuário - */

  const [userRole, setUserRole] = useState<"admin" | "user">("user");

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Definições - */

  const navigate = useNavigate();

  /* - Funções - */

  // 1. Verifica se o usuário marcou o rememberMe para saber qual client usar

  const getClient = () => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    return rememberMe ? supabase : supabaseTemp;
  };

  // 2. Busca a sessão e a role do usuário logado

  const fetchSession = async () => {
    const client = getClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (session) {
      setSession(session);
      setIsAuthenticated(true);

      const { data: userData } = await client
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setUserRole(userData?.role ?? "user");
    } else {
      setSession(null);
      setIsAuthenticated(false);
      setUserRole("user");
    }

    setIsLoading(false);
  };

  // 2. Detecta mudança de estado de autenticação do usuário em tempo real

  useEffect(() => {
    fetchSession();

    const { data: supabaseAuthListener } = supabase.auth.onAuthStateChange(
      (e: AuthChangeEvent, session: Session | null) => {
        if (e === "SIGNED_OUT") navigate("/", { replace: true });
        setSession(session);
        setIsAuthenticated(!!session);
      },
    );

    const { data: supabaseTempAuthListener } =
      supabaseTemp.auth.onAuthStateChange(
        (e: AuthChangeEvent, session: Session | null) => {
          if (e === "SIGNED_OUT") navigate("/", { replace: true });
          setSession(session);
          setIsAuthenticated(!!session);
        },
      );

    return () => {
      supabaseAuthListener.subscription.unsubscribe();
      supabaseTempAuthListener.subscription.unsubscribe();
    };
  }, []);

  /* - "Carregando..." até o Supabase retornar uma sessão válida - */

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center max-w-full min-h-screen bg-[url(./src/assets/images/ph-quinas.png)] bg-cover bg-center">
        <motion.span
          className="text-5xl text-white font-semibold"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 8 }}
        >
          Carregando...
        </motion.span>
      </div>
    );
  }

  return (
    <Routes>
      {AdminRoutes({ session, user_role: userRole, AdminLayout })}
      {AuthenticationRoutes()}
      {GeneralRoutes({ session, AppLayout })}
      {FooterRoutes({ session })}
    </Routes>
  );
};

const AppLayout = () => {
  return (
    <div className="select-none">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div className="select-none">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
