import { render } from "@react-email/components";
import { useEffect, useState } from "react";
import { VlidateAccountEmail } from "./ValidateAccountEmail";

export default {
  title: "Components/Emails/Templates",
  component: VlidateAccountEmail,
  parameters: {
    layout: "fullscreen",
  },
};

type ValidateAccountEmailProps = React.ComponentProps<typeof VlidateAccountEmail>;

/* - Renderizando o email em HTML, que é o que chega na caixa de entrada - */

const ValidateAccountEmailTemplate = ({ name, validationLink }: ValidateAccountEmailProps) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const generateHtml = async () => {
      const result = await render(
        <VlidateAccountEmail
          name={name}
          validationLink={validationLink}
        />,
      );

      setHtml(result);
    };
    generateHtml();
  }, [name, validationLink]);

  return (
    <div
      className="min-h-screen bg-[#0A0A0A]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export { ValidateAccountEmailTemplate as "Validate Account" };

ValidateAccountEmailTemplate.args = {
  name: "Usuário",
  validationLink: "https://prismahall.com/validar-conta?token=exemplo123",
};
