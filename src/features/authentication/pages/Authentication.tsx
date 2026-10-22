"use client";

import { AnimatePresence, motion } from "motion/react";
import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { CircleCheck } from "lucide-react";
import { CustomTextInput, CustomPasswordInput } from "@/shared/components";
import { FaUser } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { regex, masks } from "@/shared/utils";
import { ResendValidationButton } from "../components/ResendValidationButton";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import { useState, useRef, useEffect } from "react";

const Authentication = () => {
  /* - Puxando do context - */

  const { signUpMutation } = useSession();

  /* - Estados de cadastro - */

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

  /* - Estados de erro/sucesso - */

  const [signUpError, setSignUpError] = useState<string>("");
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  /* - Definições - */

  const signUpRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  /* - Funções - */

  // 1. Cria a conta do usuário

  const handleCreateAccount = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !confirmEmail.trim() || !password.trim() || !confirmPassword.trim()) {
      setSignUpError("Preencha todos os campos.");
      return;
    }

    if (!regex.name.test(name)) {
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

    const result = await signUpMutation({ name, email, password, confirmPassword });

    if (result === "email_is_not_unique") {
      setSignUpError("Email já cadastrado no nosso banco de dados.");
      return;
    }

    if (result === "too_many_attempts") {
      setSignUpError("Muitas tentativas. Tente novamente em alguns minutos.");
      return;
    }

    if (!result) {
      setSignUpError("Não foi possível criar a conta. Verifique os dados e tente novamente.");
      return;
    }

    setSignUpSuccess(true);
    setRegisteredEmail(email);

    setName("");
    setEmail("");
    setConfirmEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // 2. Esconde o aviso de sucesso depois de alguns segundos

  useEffect(() => {
    if (!signUpSuccess) {
      return;
    }

    const timer = setTimeout(() => setSignUpSuccess(false), 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [signUpSuccess]);

  // 3. Fecha o erro ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside = !signUpRef.current || signUpRef.current.contains(e.target as Node);

      if (clickedInside) {
        return;
      }

      setSignUpError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* - Aviso de sucesso - */

  const signUpSuccessToast = (
    <AnimatePresence>
      {signUpSuccess && (
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
              <p className="text-black font-bold leading-tight">Conta criada!</p>

              <p className="text-black/80 text-sm font-medium leading-snug mt-1">
                Enviamos um link para o seu e-mail. Valide a conta para poder entrar.
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
  );

  /* - Depois do cadastro: pede para validar o e-mail e oferece o reenvio - */

  if (registeredEmail) {
    return (
      <>
        {signUpSuccessToast}

        <AuthenticationScreenShell image="/images/ph-palco.png">
          <div className="flex flex-col items-center w-full mb-14 sm:my-3">
            <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
              <p className="text-white text-2xl sm:text-lg font-bold text-center">Valide o seu e-mail</p>

              <p className="text-sm text-white mt-6 text-center">
                Enviamos um link de validação para <span className="font-bold">{registeredEmail}</span>. O link expira em 15 minutos.
              </p>

              <p className="text-sm text-white/60 mt-4 text-center">Você só poderá entrar na sua conta depois de validar o e-mail.</p>

              {/* - Botão de reenvio - */}

              <div className="my-4">
                <ResendValidationButton
                  email={registeredEmail}
                  startWithCooldown
                />
              </div>

              {/* - Link para a página de login - */}

              <div className="flex justify-center items-center text-sm text-white font-semibold">
                <span
                  className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                  onClick={() => router.replace("/login")}
                >
                  Ir para a tela de Login!
                </span>
              </div>
            </div>
          </div>
        </AuthenticationScreenShell>
      </>
    );
  }

  return (
    <>
      {signUpSuccessToast}

      <AuthenticationScreenShell image="/images/ph-palco.png">
        <div className="flex flex-col items-center w-full mb-14 sm:my-3">
          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">Cadastre-se</p>

            {/* - Input de nome - */}

            <CustomTextInput
              className="bg-black/80"
              icon={<FaUser />}
              label="Seu Nome"
              placeholder="Nome Completo"
              value={name}
              onChange={(value) => setName(masks.name(String(value)))}
              maxLength={50}
              readOnly={false}
            />

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

            {/* - Input de confirmação de email - */}

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

            {/* - Input de senha - */}

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••"
              value={password}
              onChange={setPassword}
              maxLength={50}
            />

            {/* - Input de confimação de senha - */}

            <CustomPasswordInput
              className="bg-black/80"
              label="Sua Senha"
              placeholder="•••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              maxLength={50}
            />

            <div className="flex items-center">
              {/* - Checkbox - */}

              <input
                className="appearance-none w-4 h-4 border border-[#B8860B] rounded-sm cursor-pointer bg-black/90 checked:bg-[#B8860B] checked:bg-center checked:bg-no-repeat checked:bg-[url(/checkbox/checkmark.svg)]"
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={() => setHasAcceptedTerms(!hasAcceptedTerms)}
              />

              {/* - Termos de uso e políticas de privacidade - */}

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

            {/* - Botão de cadastro - */}

            <motion.button
              className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-3 md:my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!hasAcceptedTerms}
              onClick={handleCreateAccount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cadastrar
            </motion.button>

            {/* - Seção de erro - */}

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

            {/* - Link de para a página de login - */}

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
