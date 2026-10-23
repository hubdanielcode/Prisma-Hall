import { AuthenticationScreenShell } from "../components/AuthenticationScreenShell";
import { ResendValidationButton } from "./ResendValidationButton";

export default {
  title: "Layouts/Public/Resend Validation Button",
  component: ResendValidationButton,
  parameters: {
    layout: "fullscreen",
  },
};

const email = "email.email@gmail.com";

/* - Simulando o botão de reenvio sem a lógica, para a story ficar parada no estado que ela mostra. - */

const ResendSimulation = ({ label, isDisabled, message }: { label: string; isDisabled: boolean; message?: string }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        className="text-sm font-bold text-white cursor-pointer enabled:hover:bg-clip-text enabled:hover:text-transparent enabled:hover:bg-linear-to-br enabled:hover:from-yellow-500 enabled:hover:via-yellow-600 enabled:hover:to-yellow-700 enabled:hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        type="button"
        disabled={isDisabled}
      >
        {label}
      </button>

      <div className="flex justify-center w-full min-h-20">
        {message ? <span className="text-[#DDAE56] text-sm text-center">{message}</span> : null}
      </div>
    </div>
  );
};

/* - Simulando a tela de validação de e-mail que aparece depois do cadastro, já que a página de cadastro só chega nela após enviar o formulário. - */

const ValidateEmailCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthenticationScreenShell image="/images/ph-palco.png">
      <div className="flex flex-col items-center w-full mb-14 sm:my-3">
        <div className="bg-black/70 rounded-lg p-6 text-white w-[90%] md:w-[25%] border-2 border-[#B8860B] sm:max-h-[80vh] sm:overflow-y-auto sm:mt-auto">
          <p className="text-white text-2xl sm:text-lg font-bold text-center">Valide o seu e-mail</p>

          <p className="text-sm text-white mt-6 text-center">
            Enviamos um link de validação para <span className="font-bold">{email}</span>. O link expira em 15 minutos. Se não encontrar o e-mail,
            verifique também a caixa de spam.
          </p>

          <p className="text-sm text-white/60 mt-4 text-center">Você só poderá entrar na sua conta depois de validar o e-mail.</p>

          <div className="my-4">{children}</div>

          <div className="flex justify-center items-center text-sm text-white font-semibold">
            <span className="font-bold hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline cursor-pointer">
              Ir para a tela de Login!
            </span>
          </div>
        </div>
      </div>
    </AuthenticationScreenShell>
  );
};

/* - Tela recém-aberta: o botão de reenvio está habilitado - */

const ValidateEmail = () => {
  return (
    <ValidateEmailCard>
      <ResendSimulation
        label="Reenviar e-mail de validação"
        isDisabled={false}
      />
    </ValidateEmailCard>
  );
};

/* - Depois do reenvio: o botão fica desativado com a contagem e aparece o aviso de sucesso - */

const ValidateEmailAfterResend = () => {
  return (
    <ValidateEmailCard>
      <ResendSimulation
        label="Reenviar e-mail (59s)"
        isDisabled
        message="Se o e-mail estiver cadastrado e ainda não validado, enviamos um novo link. Ele expira em 15 minutos. Se não encontrar o e-mail, verifique a caixa de spam."
      />
    </ValidateEmailCard>
  );
};

export { ValidateEmail as "Validate Email", ValidateEmailAfterResend as "Validate Email After Resend" };
