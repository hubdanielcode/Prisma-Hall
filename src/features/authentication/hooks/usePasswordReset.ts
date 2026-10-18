"use client";

import { requestPasswordReset as requestPasswordResetAction, passwordReset as passwordResetAction } from "@/actions";
import { useMutation } from "@tanstack/react-query";

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
