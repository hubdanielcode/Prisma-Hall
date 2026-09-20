import { AuthenticationScreenShell } from "./AuthenticationScreenShell";

export default {
  title: "Layouts/Public/Authentication Secreen Shells",
  component: AuthenticationScreenShell,
  parameters: {
    layout: "fullscreen",
  },
};

/* - Criando um card de exemplo, já que o authentication shell não renderiza nada sozinho. - */

const ExempleCard = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col items-center w-full sm:pt-3 sm:pb-4 pt-4 pb-8">
      <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B]">
        <p className="text-white text-2xl sm:text-lg font-bold text-center">{title}</p>
      </div>
    </div>
  );
};

/* - Simulando o componente de cadastro - */

const signUpShell = () => {
  return (
    <AuthenticationScreenShell image="/images/ph-palco.png">
      <ExempleCard title="Cadastre-se" />
    </AuthenticationScreenShell>
  );
};

/* - Simulando o componente de login - */

const signInShell = () => {
  return (
    <AuthenticationScreenShell image="/images/ph-palco.png">
      <ExempleCard title="Entrar" />
    </AuthenticationScreenShell>
  );
};

/* - Simulando o componente de recuperação de senha - */

const recoverPasswordShell = () => {
  return (
    <AuthenticationScreenShell image="/images/ph-palco.png">
      <ExempleCard title="Recuperar Senha" />
    </AuthenticationScreenShell>
  );
};

export { signUpShell as "Authentication Shell" };
export { signInShell as "Login Shell" };
export { recoverPasswordShell as "Recover Password Shell" };
