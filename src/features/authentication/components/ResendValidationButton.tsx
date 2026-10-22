"use client";

import { useAccountValidation } from "../hooks/useAccountValidation";
import { useEffect, useState } from "react";

interface ResendValidationButtonProps {
  email: string;
  startWithCooldown?: boolean;
}

interface ResendFeedbackProps {
  type: "success" | "error";
  message: string;
}

const resendCooldownSeconds = 60;

const ResendValidationButton = ({ email, startWithCooldown = false }: ResendValidationButtonProps) => {
  /* - Puxando do hook - */

  const { resendValidationEmailMutation } = useAccountValidation();

  /* - Estados do reenvio - */

  const [secondsLeft, setSecondsLeft] = useState<number>(startWithCooldown ? resendCooldownSeconds : 0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ResendFeedbackProps | null>(null);

  /* - Funções - */

  // 1. Pede um novo link de validação (o servidor também aplica o intervalo de 60 segundos e o limite por hora)

  const handleResend = async () => {
    setFeedback(null);
    setIsSending(true);

    try {
      const resendResult = await resendValidationEmailMutation(email);

      if (resendResult === "too_soon") {
        setSecondsLeft(resendCooldownSeconds);
        setFeedback({ type: "error", message: "Aguarde um minuto antes de pedir outro e-mail." });
        return;
      }

      if (resendResult === "too_many_attempts") {
        setFeedback({ type: "error", message: "Muitas tentativas. Tente novamente em alguns minutos." });
        return;
      }

      if (!resendResult) {
        setFeedback({ type: "error", message: "Digite um endereço de email válido." });
        return;
      }

      setSecondsLeft(resendCooldownSeconds);
      setFeedback({
        type: "success",
        message: "Se o e-mail estiver cadastrado e ainda não validado, enviamos um novo link. Ele expira em 15 minutos.",
      });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível reenviar o e-mail. Tente novamente." });
    } finally {
      setIsSending(false);
    }
  };

  // 2. Contagem regressiva do intervalo entre reenvios

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        className="text-sm font-bold text-white cursor-pointer enabled:hover:bg-clip-text enabled:hover:text-transparent enabled:hover:bg-linear-to-br enabled:hover:from-yellow-500 enabled:hover:via-yellow-600 enabled:hover:to-yellow-700 enabled:hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        type="button"
        disabled={isSending || secondsLeft > 0 || !email.trim()}
        onClick={handleResend}
      >
        {isSending ? "Enviando..." : secondsLeft > 0 ? `Reenviar e-mail (${secondsLeft}s)` : "Reenviar e-mail de validação"}
      </button>

      {feedback ? (
        <span className={feedback.type === "success" ? "text-[#DDAE56] text-sm text-center" : "text-red-400 text-sm text-center"}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
};

export { ResendValidationButton };
