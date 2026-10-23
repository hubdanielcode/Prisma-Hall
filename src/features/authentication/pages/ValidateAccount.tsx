"use client";

import { AnimatePresence, motion } from "motion/react";
import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { CircleCheck } from "lucide-react";
import { CustomTextInput } from "@/shared/components";
import { MdAlternateEmail } from "react-icons/md";
import { masks } from "@/shared/utils";
import { ResendValidationButton } from "../components/ResendValidationButton";
import { useAccountValidation } from "../hooks/useAccountValidation";
import { useSession } from "../hooks/useSession";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ValidationStatusProps = "loading" | "success" | "error" | "too_many_attempts";

const ValidateAccount = () => {
  /* - Puxando do hook - */

  const { validateAccountMutation } = useAccountValidation();
  const { invalidateAllSessionQueries } = useSession();

  /* - Estados de validação - */

  const [validationStatus, setValidationStatus] = useState<ValidationStatusProps>("loading");
  const [resendEmail, setResendEmail] = useState<string>("");
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  /* - Definições - */

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasValidatedRef = useRef<boolean>(false);

  /* - Funções - */

  // 1. Valida a conta assim que a página abre (o ref impede uma segunda chamada no modo estrito do React, que gastaria o link)

  useEffect(() => {
    if (hasValidatedRef.current) {
      return;
    }

    hasValidatedRef.current = true;

    if (!token) {
      setValidationStatus("error");
      return;
    }

    const validateAccountFromLink = async () => {
      try {
        const validateAccountResult = await validateAccountMutation(token);

        if (validateAccountResult === "too_many_attempts") {
          setValidationStatus("too_many_attempts");
          return;
        }

        if (validateAccountResult === "validated_and_signed_in") {
          setIsSignedIn(true);
          setValidationStatus("success");

          // O servidor já criou a sessão: atualiza o que o app guardou dela para a página inicial abrir com o usuário logado
          await invalidateAllSessionQueries().catch(() => undefined);
          return;
        }

        setValidationStatus(validateAccountResult ? "success" : "error");
      } catch {
        setValidationStatus("error");
      }
    };

    validateAccountFromLink();
  }, [token, validateAccountMutation, invalidateAllSessionQueries]);

  // 2. Depois de validar, leva o usuário para a página inicial (se a sessão foi criada) ou para a página de login

  useEffect(() => {
    if (validationStatus !== "success") {
      return;
    }

    const timer = setTimeout(() => router.replace(isSignedIn ? "/" : "/login"), 3500);

    return () => clearTimeout(timer);
  }, [validationStatus, isSignedIn, router]);

  return (
    <>
      <AnimatePresence>
        {/* - Toast de sucesso - */}

        {validationStatus === "success" && (
          <motion.div
            className="bg-[#B8860B] border border-black rounded-lg w-72 md:w-80 p-4 shadow-lg shadow-black/40"
            style={{ position: "fixed", top: 24, right: 24, zIndex: 9999 }}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
          >
            <div className="flex items-start gap-3">
              <CircleCheck className="h-6 w-6 shrink-0 text-black" />

              <div className="flex flex-col">
                <p className="text-black font-bold leading-tight">Conta validada!</p>

                <p className="text-black/80 text-sm font-medium leading-snug mt-1">
                  {isSignedIn
                    ? "Tudo certo! Você já está logado e estamos te levando para a página inicial."
                    : "Tudo certo! Estamos te levando para a tela de login."}
                </p>
              </div>
            </div>

            <div className="w-full h-1.5 bg-[#7A5A08] rounded-full overflow-hidden mt-3">
              <motion.div
                className="h-full bg-black rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthenticationScreenShell image="/images/ph-mezanino.png">
        <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">Validar Conta</p>

            {/* - Validando - */}

            {validationStatus === "loading" && <p className="text-sm text-white mt-6 mb-4 text-center">Validando a sua conta...</p>}

            {/* - Sucesso - */}

            {validationStatus === "success" && (
              <p className="text-sm text-white mt-6 mb-4 text-center">
                {isSignedIn
                  ? "Tudo certo! Você já está logado na sua conta. Seja bem-vindo(a) ao Prisma Hall!"
                  : "Tudo certo! Você já pode entrar na sua conta. Estamos te levando para a tela de login!"}
              </p>
            )}

            {/* - Muitas tentativas - */}

            {validationStatus === "too_many_attempts" && (
              <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center mt-6 mb-4">
                Muitas tentativas. Tente novamente em alguns minutos.
              </p>
            )}

            {/* - Link inválido ou expirado: pede o e-mail para mandar um link novo - */}

            {validationStatus === "error" && (
              <>
                <p className="flex items-center justify-center h-12 rounded-xl bg-red-100 border border-red-300 text-red-700 text-sm font-semibold px-4 text-center mt-6">
                  Link inválido ou expirado.
                </p>

                <p className="text-sm text-white mt-4 text-center">Informe o seu e-mail para receber um novo link de validação</p>

                <CustomTextInput
                  className="bg-black/80"
                  type="email"
                  icon={<MdAlternateEmail />}
                  label="Seu Email"
                  placeholder="seu@email.com"
                  value={resendEmail}
                  onChange={(value) => setResendEmail(masks.email(String(value)))}
                  maxLength={50}
                  readOnly={false}
                />

                <div className="my-4">
                  <ResendValidationButton email={resendEmail} />
                </div>
              </>
            )}

            {/* - Link para a página de login - */}

            <div className="flex justify-center items-center text-sm text-white font-semibold mt-4">
              <span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => router.replace(isSignedIn ? "/" : "/login")}
              >
                {isSignedIn ? "Ir para a página inicial!" : "Voltar para a tela de Login!"}
              </span>
            </div>
          </div>
        </div>
      </AuthenticationScreenShell>
    </>
  );
};

export { ValidateAccount };
