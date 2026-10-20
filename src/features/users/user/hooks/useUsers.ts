"use client";

import { deleteUser as deleteUserAction, editUser as editUserAction, getAllUsers } from "@/actions";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { UserProps } from "../types/user";

const useUsers = (
  currentPage: number,
  itemsPerPage: number,
  searchQuery: string,
  selectedRole: "all_roles" | "user" | "admin",
  selectedStatus: "all_status" | "validated" | "not_validated",
) => {
  const queryClient = useQueryClient();

  /* - Estados dos usuários - */

  const [userBeingEdited, setUserBeingEdited] = useState<UserProps | null>(null);
  const [userBeingDeleted, setUserBeingDeleted] = useState<UserProps | null>(null);

  /* - Definições - */

  // 1. Invalida a lista de usuários e as estatísticas, e também o que depende do usuário logado (perfil e sessão), já que o admin pode ter editado a própria conta

  const invalidateUserRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users"] }),
      queryClient.invalidateQueries({ queryKey: ["users-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
      queryClient.invalidateQueries({ queryKey: ["adminSession"] }),
      queryClient.invalidateQueries({ queryKey: ["protectedSession"] }),
    ]);
  };

  /* - Query de leitura - */

  // 1. Uma consulta por página e combinação de filtros; o keepPreviousData mantém a página anterior na tela enquanto a nova carrega

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", currentPage, itemsPerPage, searchQuery, selectedRole, selectedStatus],
    queryFn: () => getAllUsers({ currentPage, itemsPerPage, searchQuery, selectedRole, selectedStatus }),
    placeholderData: keepPreviousData,
  });

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

  // 2. DeleteUserMutation. O resultado pode ser "active_orders" ou "last_admin" (exclusão bloqueada), então só invalida quando for true

  const { mutateAsync: deleteUserMutation } = useMutation({
    mutationFn: deleteUserAction,
    onSuccess: async (deleteUserMutationResult) => {
      if (deleteUserMutationResult === true) {
        await invalidateUserRelatedQueries();
      }
    },
  });

  return {
    /* - Query de leitura - */

    users: data ? data.users : [],
    total: data ? data.total : 0,
    totalPages: data ? data.totalPages : 0,
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
