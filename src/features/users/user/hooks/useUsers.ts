"use client";

import { deleteUser as deleteUserAction, editUser as editUserAction, getAllUsers } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { UserProps } from "../types/user";

const useUsers = () => {
  const queryClient = useQueryClient();

  /* - Estados dos usuários - */

  const [userBeingEdited, setUserBeingEdited] = useState<UserProps | null>(null);
  const [userBeingDeleted, setUserBeingDeleted] = useState<UserProps | null>(null);

  /* - Definições - */

  // 1. Invalida a lista de usuários e também o que depende do usuário logado (perfil e sessão), já que o admin pode ter editado a própria conta

  const invalidateUserRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
      queryClient.invalidateQueries({ queryKey: ["adminSession"] }),
      queryClient.invalidateQueries({ queryKey: ["protectedSession"] }),
    ]);
  };

  /* - Query de leitura - */

  const { data: users, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: getAllUsers });

  /* - Mutations - */

  // 1. EditUserMutation

  const { mutateAsync: editUserMutation } = useMutation({
    mutationFn: editUserAction,
    onSuccess: async (editUserMutationResult) => {
      if (editUserMutationResult) {
        await invalidateUserRelatedQueries();
      }
    },
  });

  // 2. DeleteUserMutation

  const { mutateAsync: deleteUserMutation } = useMutation({
    mutationFn: deleteUserAction,
    onSuccess: async (deleteUserMutationResult) => {
      if (deleteUserMutationResult) {
        await invalidateUserRelatedQueries();
      }
    },
  });

  return {
    /* - Query de leitura - */

    users,
    isLoading,
    error,

    /* - Mutations - */

    editUserMutation,
    deleteUserMutation,

    /* - Estados dos usuários - */

    userBeingEdited,
    setUserBeingEdited,
    userBeingDeleted,
    setUserBeingDeleted,
  };
};

export { useUsers };
