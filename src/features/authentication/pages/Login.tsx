import { CustomTextInput, CustomPasswordInput } from "@/shared/index";
import { MdAlternateEmail } from "react-icons/md";
import { motion } from "framer-motion";
import { regex, masks } from "@/shared/index";
import { supabase, supabaseTemp } from "../../../../supabase/supabase";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Login = () => {
  /* - Puxando do context - */

  const { setFullName, email, setEmail } = useAuthenticationContext();

  /* - Estados de cadastro - */

  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  /* - Estados de erro - */

  const [signInError, setSignInError] = useState<string>("");

  /* - Estados de privacidade - */

  /* - Definições - */

  const signInRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const client = rememberMe ? supabase : supabaseTemp;

  /* - Funções - */

  // 1. Conecta na aplicação e limpa os valores digitados

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

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

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

    navigate("/", { replace: true });
  };

  // 2. Fecha os erros ao clicar fora

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedInside =
        !signInRef.current || signInRef.current.contains(e.target as Node);

      if (clickedInside) return;
      setSignInError("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center sm:justify-start">
      {/* - Seção 1: Lado esquerdo - */}

      <div
        className="hidden md:block absolute inset-0 bg-[url(./src/assets/images/ph-quinas.png)] bg-cover"
        style={{ clipPath: "polygon(0% 30%, 33% 100%, 0% 100%)" }}
      />

      {/* - Seção 2: centro - */}

      <div className="flex justify-center items-center w-full sm:min-h-10 min-h-screen bg-[url(./src/assets/images/ph-palco-mezanino.png)] bg-cover bg-center md:[clip-path:polygon(0%_0%,67%_0%,100%_70%,100%_100%,33%_100%,0%_30%)]">
        {/* - Centralizador - */}

        <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
          {/* - Card - */}

          <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
            <p className="text-white text-2xl sm:text-lg font-bold text-center">
              Entrar
            </p>

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
              maxLength={50}
            />

            {/* - Checkbox de persistência de sessão - */}

            <div className="flex items-center">
              <input
                className="appearance-none w-4 h-4 border border-[#B8860B] rounded-sm cursor-pointer bg-black/90 checked:bg-[#B8860B] checked:bg-center checked:bg-no-repeat checked:bg-[url(./src/assets/checkbox/checkmark.svg)]"
                type="checkbox"
                onClick={() => setRememberMe(!rememberMe)}
              />

              <p className="text-white/60 text-sm ml-2">Lembrar-me</p>

              <span
                className="ml-auto text-sm font-semibold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => navigate("/recuperar-senha", { replace: true })}
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

            {/* - Link de cadastro - */}

            <div className="flex justify-center items-center text-sm text-white font-semibold">
              <span className="mr-2">Não possui cadastro?</span>

              <span
                className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer"
                onClick={() => navigate("/cadastro", { replace: true })}
              >
                Cadastre-se!
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
  );
};

export { Login };
