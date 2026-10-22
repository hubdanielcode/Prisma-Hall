import "server-only";
import { render } from "@react-email/components";
import type { ReactElement } from "react";

/* - Cliente de e-mail via Brevo, com a mesma interface que o Resend tinha (emails.send). Assim nenhum outro arquivo precisa mudar - */

type SendEmailParams = {
  from: string;
  to: string;
  subject: string;
  text?: string;
  react?: ReactElement;
};

type SendEmailResult = {
  data: { id: string } | null;
  error: { name: string; message: string } | null;
};

/* - Separa o nome de exibição de "Prisma Hall <naoresponda@x.com>". O endereço real vem do .env, porque o Brevo só envia de remetentes validados - */

const getSenderName = (from: string) => {
  const match = from.match(/^(.*)<.+>$/);

  return match ? match[1].trim() : "Prisma Hall";
};

const send = async ({ from, to, subject, text, react }: SendEmailParams): Promise<SendEmailResult> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM_ADDRESS;

  if (!apiKey || !senderEmail) {
    return { data: null, error: { name: "missing_config", message: "Defina BREVO_API_KEY e EMAIL_FROM_ADDRESS no .env" } };
  }

  try {
    const htmlContent = react ? await render(react) : undefined;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: getSenderName(from), email: senderEmail },
        to: [{ email: to }],
        subject,
        ...(htmlContent ? { htmlContent } : {}),
        ...(text ? { textContent: text } : {}),
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { data: null, error: { name: String(body.code ?? response.status), message: String(body.message ?? "Falha ao enviar pelo Brevo") } };
    }

    return { data: { id: String(body.messageId ?? "") }, error: null };
  } catch (error) {
    return { data: null, error: { name: "network_error", message: error instanceof Error ? error.message : "Erro desconhecido" } };
  }
};

const getResend = () => {
  return { emails: { send } };
};

export { getResend };
