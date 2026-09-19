"use client";

import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset as requestPasswordResetAction, passwordReset as passwordResetAction } from "@/actions";

const usePasswordReset = () => {
  // 1. requestPasswordResetMutation

  const { mutateAsync: requestPasswordResetMutation } = useMutation({ mutationFn: requestPasswordResetAction });

  // 2. passwordResetMutation

  const { mutateAsync: passwordResetMutation } = useMutation({ mutationFn: passwordResetAction });

  return {
    requestPasswordResetMutation,
    passwordResetMutation,
  };
};

export { usePasswordReset };
