import { Resend } from "resend";

const getResend = () => {
  return new Resend(process.env.RESEND_API_KEY!);
};

export { getResend };
