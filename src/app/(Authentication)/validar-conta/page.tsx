import { Suspense } from "react";
import { ValidateAccount } from "@/features/authentication/pages/ValidateAccount";

const ValidateAccountPage = () => {
  return (
    <Suspense>
      <ValidateAccount />
    </Suspense>
  );
};

export default ValidateAccountPage;
