import { PasswordReset } from "@/features/authentication/pages/PasswordReset";
import { Suspense } from "react";

const PasswordResetPage = () => {
  return (
    <Suspense>
      <PasswordReset />;
    </Suspense>
  );
};

export default PasswordResetPage;
