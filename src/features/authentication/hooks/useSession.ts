"use client";

import { signIn as signInAction, signUp as signUpAction, revokeSession as revokeSessionAction, validateSession } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type { SessionUserProps } from "../types/sessionUser";

const useSession = () => {
  const queryClient = useQueryClient();

  /* - Definições - */

  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  const sessionStaleTime = {
    admin: 60 * 30 * 1000,
    protected: 60 * 60 * 2 * 1000,
  };

  const sessionQueryKey = {
    admin: "adminSession",
    protected: "protectedSession",
  };

  const invalidateAllSessionQueries = () => {
    queryClient.invalidateQueries({ queryKey: [sessionQueryKey.admin] });
    queryClient.invalidateQueries({ queryKey: [sessionQueryKey.protected] });
  };

  /* - Query de leitura - */

  const {
    data: sessionValidationResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: [isAdminArea ? sessionQueryKey.admin : sessionQueryKey.protected],
    queryFn: validateSession,
    refetchOnWindowFocus: false,
    staleTime: isAdminArea ? sessionStaleTime.admin : sessionStaleTime.protected,
  });

  /* - Transformando o sessionValidationResult em valores prontos para serem consumidos - */

  const session = sessionValidationResult ? sessionValidationResult.session : null;
  const user: SessionUserProps | null = sessionValidationResult ? sessionValidationResult.user : null;
  const isAuthenticated = sessionValidationResult ? true : false;

  /* - Mutations - */

  // 1. SignInMutation

  const { mutateAsync: signInMutation } = useMutation({
    mutationFn: signInAction,
    onSuccess: (signInMutationResult) => {
      if (signInMutationResult) {
        invalidateAllSessionQueries();
      }
    },
  });

  // 2. SignUpMutation

  const { mutateAsync: signUpMutation } = useMutation({
    mutationFn: signUpAction,
    onSuccess: (signUpMutationResult) => {
      if (signUpMutationResult) {
        invalidateAllSessionQueries();
      }
    },
  });

  // 3. RevokeSessionMutation

  const { mutateAsync: revokeSessionMutation } = useMutation({
    mutationFn: revokeSessionAction,
    onSuccess: (revokeSessionMutationResult) => {
      if (revokeSessionMutationResult) {
        invalidateAllSessionQueries();
      }
    },
  });

  return {
    /* - Leitura - */

    session,
    user,
    isAuthenticated,
    isLoading,
    error,

    /* - Mutations - */

    signInMutation,
    signUpMutation,
    revokeSessionMutation,
  };
};

export { useSession };
