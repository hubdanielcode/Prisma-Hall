import { ResendValidationButton } from "./ResendValidationButton";

export default {
  title: "Components/Authentication/Resend Validation Button",
  component: ResendValidationButton,
  parameters: {
    layout: "centered",
  },
};

/* - Botão pronto para reenviar - */

const readyToResend = () => {
  return <ResendValidationButton email="maria.sauro@email.com" />;
};

export { readyToResend as "Ready To Resend" };
