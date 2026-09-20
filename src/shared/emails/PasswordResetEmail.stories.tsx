import { PasswordResetEmail } from "./PasswordResetEmail";
import { render } from "@react-email/components";
import { useEffect, useState } from "react";

export default {
  title: "Components/Emails/Templates",
  components: PasswordResetEmail,
};

const PasswordResetEmailTemplate = ({ resetLink }: { resetLink: string }) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const generateHtml = async () => {
      const result = await render(<PasswordResetEmail resetLink={resetLink} />);

      setHtml(result);
    };
    generateHtml();
  }, [resetLink]);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

export { PasswordResetEmailTemplate as "Password Reset" };

PasswordResetEmailTemplate.args = {
  resetLink: "https://prismahall.com/redefinir-senha?token=exemplo123",
};
