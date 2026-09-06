import { Login } from "@/features/authentication";
import { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
