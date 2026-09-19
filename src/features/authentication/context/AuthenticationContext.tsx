"use client";

import { createContext } from "react";
import type { SessionUserProps } from "../types/sessionUser";
import { useSession } from "../hooks/useSession";

interface AuthenticationContextType {
  /* - Dados da sessão - */

  isLoading: boolean;
  isAuthenticated: boolean;
  user: SessionUserProps | null;
  error: Error | null;

  /* - Mutations - */

  revokeSessionMutation: () => Promise<boolean>;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, user, error, revokeSessionMutation } = useSession();

  return (
    <AuthenticationContext.Provider
      value={{
        /* - Dados da sessão - */

        isLoading,
        isAuthenticated,
        user,
        error,

        /* - Mutations - */

        revokeSessionMutation,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
