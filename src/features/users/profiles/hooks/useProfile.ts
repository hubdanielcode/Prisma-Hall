"use client";

import { getProfile, updateProfile as updateProfileAction, deleteProfile as deleteProfileAction } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useProfile = () => {
  const queryClient = useQueryClient();

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
    onSuccess: (updateProfileMutationResult) => {
      if (updateProfileMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });

  // 1. DeleteProfileMutation

  const { mutateAsync: deleteProfileMutation } = useMutation({
    mutationFn: deleteProfileAction,
    onSuccess: (deleteProfileMutationResult) => {
      if (deleteProfileMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
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
