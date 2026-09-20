"use client";

import { AnimatePresence, motion } from "motion/react";
import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { CircleCheck } from "lucide-react";
import { MdAlternateEmail } from "react-icons/md";
import { CustomTextInput, CustomPasswordInput } from "@/shared/components";
import { regex, masks } from "@/shared/utils";
import { usePasswordReset } from "../hooks/usePasswordReset";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const PasswordReset = () => {
  /* - Puxando do context - */

  const { requestPasswordResetMutation, passwordResetMutation } = usePasswordReset();

  /* - Estados de recuperação de senha - */

  const [passwordResetEmail, setPasswordResetEmail] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  /* - Estados de erro/sucesso - */

  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<boolean | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string>("");

  /* - Definições - */

  const resetPasswordRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isTokenValid = token ? true : false;

  /* - Funções - */

  // 1. RequestPasswordReset

  const handleRequestPasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!passwordResetEmail.trim() || !regex.email.test(passwordResetEmail)) {
      setResetPasswordError("Digite um endereço de email válido.");
      return;
    }

    await requestPasswordResetMutation(passwordResetEmail);

    setPasswordResetEmail("");
    setResetPasswordSuccess(true);
  };

  // 2. PasswordReset

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      setResetPasswordError("Preencha todos os campos.");
      return;
    }

    if (newPassword.length <= 5) {
      setResetPasswordError("A sua senha deve conter um mínimo de 06 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetPasswordError("As senhas não coincidem.");
      return;
    }

    const resetPasswordResult = await passwordResetMutation({ token: token as string, password: newPassword, confirmPassword: confirmNewPassword });

    if (!resetPasswordResult) {
      setResetPasswordError("Link inválido ou expirado. Por favor, solicite outro.");
      return;
    }

    setResetPasswordSuccess(true);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  // 3. Verifica se o usuário conseguiu trocar a senha e redireciona-o para a página de login

  useEffect(() => {
    if (!resetPasswordSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      setResetPasswordSuccess(false);

      if (isTokenValid) {
        router.replace("/login");
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [resetPasswordSuccess, router, isTokenValid]);

  // 4. Fecha o erro ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !resetPasswordRef.current || resetPasswordRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

      setResetPasswordError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <AnimatePresence>
        {/* - Toast de sucesso - */}

        {resetPasswordSuccess && (
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

                <p className="mb-2">{isTokenValid ? "Senha redefinida com sucesso!" : "Email enviado com sucesso!"}</p>
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
            <p className="text-white text-2xl sm:text-lg font-bold text-center">{isTokenValid ? "Redefinir Senha" : "Recuperar Senha"}</p>

            {isTokenValid ? (
              <>
                <p className="text-sm text-white mt-6 text-center">Escolha a sua nova senha</p>

                {/* - Input de senha - */}

                <CustomPasswordInput
                  className="bg-black/80"
                  label="Nova Senha"
                  placeholder="•••••••••"
                  value={newPassword}
                  onChange={setNewPassword}
                  maxLength={30}
                />

                {/* - Input de confimação de senha - */}

                <CustomPasswordInput
                  className="bg-black/80"
                  label="Confirmae a Nova Senha"
                  placeholder="•••••••••"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  maxLength={30}
                />

                {/* - Botão de redefinir senha - */}

                <motion.button
                  className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handlePasswordReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Redefinir Senha
                </motion.button>
              </>
            ) : (
              <>
                <p className="text-sm text-white mt-6 text-center">Informe seu endereço de email para receber um link de redefinição de senha</p>

                {/* - Input de email - */}

                <CustomTextInput
                  className="bg-black/80"
                  type="email"
                  icon={<MdAlternateEmail />}
                  label="Seu Email"
                  placeholder="seu@email.com"
                  value={passwordResetEmail}
                  onChange={(value) => setPasswordResetEmail(masks.email(String(value)))}
                  maxLength={50}
                  readOnly={false}
                />

                {/* - Botão de enviar email - */}

                <motion.button
                  className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleRequestPasswordReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enviar Email
                </motion.button>
              </>
            )}

            {/* - Seção de erro - */}

            <div
              className="min-h-20 w-full"
              ref={resetPasswordRef}
            >
              {resetPasswordError && (
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center">
                  {resetPasswordError}
                </p>
              )}
            </div>

            {/* - Link para página de login - */}

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

export { PasswordReset };
