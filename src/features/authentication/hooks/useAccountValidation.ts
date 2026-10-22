"use client";

import { resendValidationEmail as resendValidationEmailAction, validateAccount as validateAccountAction } from "@/actions";
import { useMutation } from "@tanstack/react-query";

const useAccountValidation = () => {
  // 1. validateAccountMutation

  const { mutateAsync: validateAccountMutation } = useMutation({ mutationFn: validateAccountAction });

  // 2. resendValidationEmailMutation

  const { mutateAsync: resendValidationEmailMutation } = useMutation({ mutationFn: resendValidationEmailAction });

  return {
    validateAccountMutation,
    resendValidationEmailMutation,
  };
};

export { useAccountValidation };
