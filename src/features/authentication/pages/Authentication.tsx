"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleCheck } from "lucide-react";
import { CustomTextInput, CustomPasswordInput } from "@/shared/index";
import { FaUser } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { regex, masks } from "@/shared/index";
import { supabase } from "../../../../supabase/supabase";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";

const Authentication = () => {
  const { fullName, setFullName, email, setEmail } = useAuthenticationContext();

  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

  const [signUpError, setSignUpError] = useState<string>("");
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);

  const signUpRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleCreateAccount = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !confirmEmail.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setSignUpError("Preencha todos os campos.");
      return;
    }

    if (!regex.name.test(fullName)) {
      setSignUpError("Nome inválido.");
      return;
    }

    if (!regex.email.test(email)) {
      setSignUpError("Formato de Email inválido.");
      return;
    }

    if (email !== confirmEmail) {
      setSignUpError("Emails não coincidem.");
      return;
    }

    if (password.length <= 5) {
      setSignUpError("A senha deve conter, pelo menos, 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError("Senhas não coincidem.");
      return;
    }

    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: fullName,
        },
        emailRedirectTo: `${redirectUrl}/`,
      },
    });

    if (error) {
      setSignUpError("Email ou senha inválidos.");
      return;
    }

    if (data.user) {
      await supabase.from("users").insert({
        user_id: data.user.id,
        email: data.user.email,
        name: fullName,
      });
    }

    setSignUpSuccess(true);

    setFullName("");
    setEmail("");
    setConfirmEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    if (!signUpSuccess) return;

    const timer = setTimeout(() => setSignUpSuccess(false), 3500);
    return () => clearTimeout(timer);
  }, [signUpSuccess]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !signUpRef.current || signUpRef.current.contains(e.target as Node);

      if (clickedInside) return;
      setSignUpError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <AnimatePresence>
        {signUpSuccess && (
          <motion.div
            className="bg-[#B8860B] border border-black rounded-lg h-20 w-72 md:w-80 p-4"
            style={{ position: "fixed", top: 24, right: 24, zIndex: 9999 }}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
          >
            <div>
              <div className="flex items-center text-black font-semibold mb-2">
                <CircleCheck className="h-5 w-5 mr-2 mb-2" />

                <p className="mb-2">Conta criada com sucesso!</p>
              </div>

              <div className="w-full h-1.5 bg-[#7A5A08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-black rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthenticationScreenShell image="/images/ph-palco.png">
        <div className="flex flex-col items-center w-full mb-14 sm:my-3">
          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">Cadastre-se</p>

            <CustomTextInput
              className="bg-black/80"
              icon={<FaUser />}
              label="Seu Nome"
              placeholder="Nome Completo"
              value={fullName}
              onChange={(value) => setFullName(masks.fullName(String(value)))}
              maxLength={50}
              readOnly={false}
            />

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

            <CustomTextInput
              className="bg-black/80"
              icon={<MdAlternateEmail />}
              label="Confirme Seu Email"
              placeholder="seu@email.com"
              value={confirmEmail}
              onChange={(value) => setConfirmEmail(masks.email(String(value)))}
              maxLength={50}
              readOnly={false}
            />

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••"
              value={password}
              onChange={setPassword}
              maxLength={50}
            />

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              maxLength={50}
            />

            <div className="flex items-center">
              <input
                className="appearance-none w-4 h-4 border border-[#B8860B] rounded-sm cursor-pointer bg-black/90 checked:bg-[#B8860B] checked:bg-center checked:bg-no-repeat checked:bg-[url(/checkbox/checkmark.svg)]"
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={() => setHasAcceptedTerms(!hasAcceptedTerms)}
              />

              <p className="text-white text-sm ml-2">
                Li e concordo com os{" "}
                <span
                  className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                  onClick={() => router.push("/termos-de-uso")}
                >
                  Termos de Uso
                </span>{" "}
                e{" "}
                <span
                  className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                  onClick={() => router.push("/politica-de-privacidade")}
                >
                  Política de Privacidade
                </span>
              </p>
            </div>

            <motion.button
              className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-3 md:my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!hasAcceptedTerms}
              onClick={handleCreateAccount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cadastrar
            </motion.button>

            <div
              className="min-h-20"
              ref={signUpRef}
            >
              {signUpError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {signUpError}
                </p>
              )}
            </div>

            <div className="flex justify-center items-center text-sm text-white font-semibold">
              <span className="mr-2">Já possui cadastro?</span>

              <span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => router.replace("/login")}
              >
                Faça Login!
              </span>
            </div>
          </div>
        </div>
      </AuthenticationScreenShell>
    </>
  );
};

export { Authentication };
