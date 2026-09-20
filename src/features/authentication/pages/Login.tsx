"use client";

import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { CustomTextInput, CustomPasswordInput } from "@/shared/components";
import { MdAlternateEmail } from "react-icons/md";
import { motion } from "motion/react";
import { regex, masks } from "@/shared/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { useState, useRef, useEffect } from "react";

const Login = () => {
  /* - Puxando do context - */

  const { signInMutation } = useSession();

  /* - Estados de cadastro - */

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [rememberMe, setRememberMe] = useState<boolean>(false);

  /* - Estados de erro - */

  const [signInError, setSignInError] = useState<string>("");

  /* - Definições - */

  const router = useRouter();
  const searchParams = useSearchParams();
  const signInRef = useRef<HTMLDivElement | null>(null);
  const from = searchParams.get("from");

  /* - Funções - */

  // 1. Faz o login do usuário

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

    const result = await signInMutation({ typedEmail: email, typedPassword: password, rememberMe });

    if (!result) {
      setSignInError("Email ou senha inválidos.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
      localStorage.setItem("rememberMe", String(rememberMe));
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberMe");
    }

    setEmail("");
    setPassword("");

    router.replace(from || "/");
  };

  // 2. Fecha o erro ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !signInRef.current || signInRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

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

            {/* - Input de email - */}

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

            {/* - Input de senha - */}

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••••"
              value={password}
              onChange={setPassword}
              maxLength={30}
            />

            <div className="flex items-center">
              {/* - Checkbox - */}

              <input
                className="appearance-none w-4 h-4 border border-[#B8860B] rounded-sm cursor-pointer bg-black/90 checked:bg-[#B8860B] checked:bg-center checked:bg-no-repeat checked:bg-[url(/checkbox/checkmark.svg)]"
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

            {/* - Botão de login - */}

            <motion.button
              className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleLoginWithAccount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar
            </motion.button>

            {/* - Seção de erro - */}

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

            {/* - Link para a página de cadastro - */}

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
