"use client";

import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { CustomTextInput, CustomPasswordInput, regex, masks } from "@/shared/index";
import { MdAlternateEmail } from "react-icons/md";
import { motion } from "motion/react";
import { supabase, supabaseTemp } from "../../../../supabase/supabase";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const Login = () => {
  const { setFullName, email, setEmail } = useAuthenticationContext();

  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>("");

  const signInRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const client = rememberMe ? supabase : supabaseTemp;

  const handleLoginWithAccount = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setSignInError("Preencha todos os campos.");
      return;
    }

    if (!regex.email.test(email)) {
      setSignInError("Formato de Email inválido.");
      return;
    }

    if (password.length <= 5) {
      setSignInError("A senha deve conter, pelo menos, 6 caracteres");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      setSignInError("Email ou senha inválidos.");
      return;
    }

    if (data.session) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", String(rememberMe));
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      const { data: userData } = await client
        .from("users")
        .select("name")
        .eq("user_id", data.user.id)
        .single();

      if (userData?.name) {
        setFullName(userData.name);
      }
    }

    setEmail("");
    setPassword("");

    router.replace("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !signInRef.current || signInRef.current.contains(e.target as Node);
      if (clickedInside) return;
      setSignInError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <AuthenticationScreenShell image="/images/ph-mezanino.png">
        <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">Entrar</p>

            <CustomTextInput
              className="bg-black/80"
              type="email"
              icon={<MdAlternateEmail />}
              label="Seu Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(value) => setEmail(masks.email(String(value)))}
              maxLength={50}
              readOnly={false}
            />

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••••"
              value={password}
              onChange={setPassword}
              maxLength={50}
            />

            <div className="flex items-center">
              <input
                className="appearance-none w-4 h-4 border border-[#B8860B] rounded-sm cursor-pointer bg-black/90 checked:bg-[#B8860B] checked:bg-center checked:bg-no-repeat checked:bg-[url(/assets/checkbox/checkmark.svg)]"
                type="checkbox"
                onClick={() => setRememberMe(!rememberMe)}
              />

              <p className="text-white/60 text-sm ml-2">Lembrar-me</p>

              <span
                className="ml-auto text-sm font-semibold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => router.replace("/recuperar-senha")}
              >
                Esqueci minha senha
              </span>
            </div>

            <motion.button
              className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleLoginWithAccount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar
            </motion.button>

            <div
              className="min-h-20 w-full"
              ref={signInRef}
            >
              {signInError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {signInError}
                </p>
              )}
            </div>

            <div className="flex justify-center items-center text-sm text-white font-semibold">
              <span className="mr-2">Não possui cadastro?</span>

              <span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => router.replace("/cadastro")}
              >
                Cadastre-se!
              </span>
            </div>
          </div>
        </div>
      </AuthenticationScreenShell>
    </>
  );
};

export { Login };
