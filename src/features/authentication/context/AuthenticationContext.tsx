import { createContext, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthenticationContextType {
  /* - Estados do usuário - */

  fullName: string;
  setFullName: (fullName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;

  /* - Estados de sessão - */

  session: Session | null;
  setSession: (session: Session | null) => void;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(
  null,
);

const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  /* - Estados do usuário - */

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /* - Estados de sessão - */

  const [session, setSession] = useState<Session | null>(null);

  /* - Funções - */

  // 1.

  return (
    <AuthenticationContext.Provider
      value={{
        /* - Estados do usuário - */
        fullName,
        setFullName,
        email,
        setEmail,
        phoneNumber,
        setPhoneNumber,
        isAuthenticated,
        setIsAuthenticated,

        /* - Estados de sessão - */

        session,
        setSession,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
