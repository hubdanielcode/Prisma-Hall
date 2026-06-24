import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { CustomTextInput } from "@/shared/index";
import { MdAlternateEmail } from "react-icons/md";
import { regex, masks } from "@/shared/index";
import { supabase } from "../../../../supabase/supabase";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const RecoverPassword = () => {
  /* - Estados de cadastro - */

  const [recoverEmail, setRecoverEmail] = useState<string>("");

  /* - Estados de erro e sucesso - */

  const [recoverPasswordError, setRecoverPasswordError] = useState<string>("");
  const [recoverPasswordSuccess, setRecoverPasswordSuccess] =
    useState<boolean>(false);

  /* - Definições - */

  const recoverPasswordRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  /* - Funções - */

  // 1. Envia um email de recuperação de senha ao email digitado e limpa os valores digitados

  const handleRecoverPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!recoverEmail.trim() || !regex.email.test(recoverEmail)) {
      setRecoverPasswordError("Digite um endereço de email válido.");
      return;
    }

    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", recoverEmail)
      .single();

    if (!data) {
      setRecoverPasswordError("Email não cadastrado.");
      return;
    }

    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

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

  // 2. Esconde o toast após 3.5s

  useEffect(() => {
    if (!recoverPasswordSuccess) return;

    const timer = setTimeout(() => setRecoverPasswordSuccess(false), 3500);
    return () => clearTimeout(timer);
  }, [recoverPasswordSuccess]);

  // 3. Fecha os erros ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside =
        !recoverPasswordRef.current ||
        recoverPasswordRef.current.contains(e.target as Node);

      if (clickedInside) return;
      setRecoverPasswordError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* - Animação para confirmar que o email foi enviado - */}

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

      <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center sm:justify-start">
        {/* - Seção 1: Lado esquerdo - */}

        <div
          className="hidden md:block absolute inset-0 bg-[url(./src/assets/images/ph-quinas.png)] bg-cover"
          style={{ clipPath: "polygon(0% 30%, 33% 100%, 0% 100%)" }}
        />

        {/* - Seção 2: centro - */}

        <div className="flex justify-center items-center w-full sm:min-h-10 min-h-screen bg-[url(./src/assets/images/ph-bar.png)] bg-cover bg-center md:[clip-path:polygon(0%_0%,67%_0%,100%_70%,100%_100%,33%_100%,0%_30%)]">
          {/* - Centralizador - */}

          <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
            {/* - Card - */}

            <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
              <p className="text-white text-2xl sm:text-lg font-bold text-center">
                Recuperar Senha
              </p>

              <p className="text-sm text-white mt-6 text-center">
                Informe seu endereço de email para receber um link de
                redefinição de senha
              </p>

              {/* - Input de email - */}

              <CustomTextInput
                className="bg-black/80"
                type="email"
                icon={<MdAlternateEmail />}
                label="Seu Email"
                placeholder="seu@email.com"
                value={recoverEmail}
                onChange={(value) =>
                  setRecoverEmail(masks.email(String(value)))
                }
                maxLength={50}
                readOnly={false}
              />

              {/* - Botão de solicitação de email - */}

              <motion.button
                className="w-full h-fit px-4 py-2 rounded-lg bg-[#B8860B] text-white text-shadow-xs text-shadow-black font-semibold text-lg my-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleRecoverPassword}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enviar Email
              </motion.button>

              {/* - Seção de erro - */}

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

              {/* - Link de voltar para a tela de login - */}

              <div className="flex justify-center items-center text-sm text-white font-semibold">
                <span
                  className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                  onClick={() => navigate("/login", { replace: true })}
                >
                  Voltar para a tela de Login!
                </span>
              </div>
            </div>
          </div>

          {/* - Bordas - */}

          <svg
            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="67"
              y1="0"
              x2="100"
              y2="70"
              stroke="#B8860B"
              strokeWidth="0.3"
            />
          </svg>

          <svg
            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="30"
              x2="33"
              y2="100"
              stroke="#B8860B"
              strokeWidth="0.3"
            />
          </svg>
        </div>

        {/* - Seção 3: Lado direito - */}

        <div
          className="hidden md:block absolute inset-0 bg-[url(./src/assets/images/ph-quinas.png)] bg-cover"
          style={{ clipPath: "polygon(100% 70%, 67% 0%, 100% 0%)" }}
        />
      </div>
    </>
  );
};

export { RecoverPassword };
