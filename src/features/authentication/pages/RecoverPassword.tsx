"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleCheck } from "lucide-react";
import { CustomTextInput } from "@/shared/index";
import { MdAlternateEmail } from "react-icons/md";
import { regex, masks } from "@/shared/index";
import { supabase } from "../../../../supabase/supabase";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";

const RecoverPassword = () => {
  const [recoverEmail, setRecoverEmail] = useState<string>("");

  const [recoverPasswordError, setRecoverPasswordError] = useState<string>("");
  const [recoverPasswordSuccess, setRecoverPasswordSuccess] = useState<boolean>(false);

  const recoverPasswordRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleRecoverPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!recoverEmail.trim() || !regex.email.test(recoverEmail)) {
      setRecoverPasswordError("Digite um endereço de email válido.");
      return;
    }

    const { data } = await supabase.from("users").select("id").eq("email", recoverEmail).single();

    if (!data) {
      setRecoverPasswordError("Email não cadastrado.");
      return;
    }

    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

    const { error } = await supabase.auth.resetPasswordForEmail(recoverEmail, {
      redirectTo: `${redirectUrl}/`,
    });

    if (error) {
      setRecoverPasswordError("Erro ao enviar email.");
      return;
    }

    setRecoverPasswordSuccess(true);
    setRecoverEmail("");
  };

  useEffect(() => {
    if (!recoverPasswordSuccess) return;

    const timer = setTimeout(() => setRecoverPasswordSuccess(false), 3500);
    return () => clearTimeout(timer);
  }, [recoverPasswordSuccess]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside =
        !recoverPasswordRef.current || recoverPasswordRef.current.contains(e.target as Node);

      if (clickedInside) return;
      setRecoverPasswordError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <AnimatePresence>
        {recoverPasswordSuccess && (
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
                <p className="mb-2">Email enviado com sucesso!</p>
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

      <AuthenticationScreenShell image="/images/ph-bar.png">
        <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">Recuperar Senha</p>

            <p className="text-sm text-white mt-6 text-center">
              Informe seu endereço de email para receber um link de redefinição de senha
            </p>

            <CustomTextInput
              className="bg-black/80"
              type="email"
              icon={<MdAlternateEmail />}
              label="Seu Email"
              placeholder="seu@email.com"
              value={recoverEmail}
              onChange={(value) => setRecoverEmail(masks.email(String(value)))}
              maxLength={50}
              readOnly={false}
            />

            <motion.button
              className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleRecoverPassword}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enviar Email
            </motion.button>

            <div
              className="min-h-20 w-full"
              ref={recoverPasswordRef}
            >
              {recoverPasswordError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {recoverPasswordError}
                </p>
              )}
            </div>

            <div className="flex justify-center items-center text-sm text-white font-semibold">
              <span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => router.replace("/login")}
              >
                Voltar para a tela de Login!
              </span>
            </div>
          </div>
        </div>
      </AuthenticationScreenShell>
    </>
  );
};

export { RecoverPassword };
