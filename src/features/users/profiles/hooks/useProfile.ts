"use client";

import { getProfile, updateProfile as updateProfileAction, deleteProfile as deleteProfileAction } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useProfile = () => {
  const queryClient = useQueryClient();

  /* - Definições - */

  const profileQueryKey = {
    admin: "adminProfile",
    protected: "protectedProfile",
  };

  const invalidateAllProfileQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [profileQueryKey.admin] }),
      queryClient.invalidateQueries({ queryKey: [profileQueryKey.protected] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
    ]);

    queryClient.removeQueries({ queryKey: ["notifications"] });
    queryClient.removeQueries({ queryKey: ["notificationPreferences"] });
  };

  /* - Query de leitura - */

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 60 * 10 * 1000,
    refetchOnWindowFocus: false,
  });

  /* - Mutations - */

  // 1. UpdateProfileMutation

  const { mutateAsync: updateProfileMutation } = useMutation({
    mutationFn: updateProfileAction,
    onSuccess: async (updateProfileMutationResult) => {
      if (updateProfileMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });

  // 1. DeleteProfileMutation

  const { mutateAsync: deleteProfileMutation } = useMutation({
    mutationFn: deleteProfileAction,
    onSuccess: async (deleteProfileMutationResult) => {
      if (deleteProfileMutationResult === true) {
        await invalidateAllProfileQueries();
      }
    },
  });

  return {
    /* - Query de leitura - */

    profile,
    isLoading,
    error,

    /* - Mutations - */

    updateProfileMutation,
    deleteProfileMutation,
  };
};

export { useProfile };
