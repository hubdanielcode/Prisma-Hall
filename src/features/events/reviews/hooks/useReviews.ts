"use client";

import { deleteReview as deleteReviewAction, getAllReviews, postReview as postReviewAction, updateReview as updateReviewAction } from "@/actions";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useReviews = (currentPage: number, itemsPerPage: number, eventId?: string, userId?: string) => {
  const queryClient = useQueryClient();

  /* - Definições - */

  // 1. Editar ou excluir uma avaliação muda a nota média do evento (events) e pode mudar os selos do usuário (perfil e sessão)

  const invalidateReviewDependentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["reviews"] }),
      queryClient.invalidateQueries({ queryKey: ["events"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
      queryClient.invalidateQueries({ queryKey: ["protectedProfile"] }),
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] }),
    ]);
  };

  /* - Query de leitura - */

  // 1. Uma consulta por página e combinação de filtros; o keepPreviousData mantém a página anterior na tela enquanto a nova carrega

  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", currentPage, itemsPerPage, eventId, userId],
    queryFn: () => getAllReviews({ currentPage, itemsPerPage, eventId, userId }),
    placeholderData: keepPreviousData,
  });

  /* - Mutations - */

  // 1. PostReviewMutation

  const { mutateAsync: postReviewMutation } = useMutation({
    mutationFn: postReviewAction,
    onSuccess: async (postReviewMutationResult) => {
      if (postReviewMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    },
  });

  // 2. UpdateReviewMutation

  const { mutateAsync: updateReviewMutation } = useMutation({
    mutationFn: updateReviewAction,
    onSuccess: async (updateReviewMutationResult) => {
      if (updateReviewMutationResult && updateReviewMutationResult !== "edit_window_expired") {
        await invalidateReviewDependentQueries();
      }
    },
  });

  // 3. DeleteReviewMutation

  const { mutateAsync: deleteReviewMutation } = useMutation({
    mutationFn: deleteReviewAction,
    onSuccess: async (deleteReviewMutationResult) => {
      if (deleteReviewMutationResult) {
        await invalidateReviewDependentQueries();
      }
    },
  });

  return {
    /* - Query de leitura - */

    reviews: data ? data.reviews : [],
    total: data ? data.total : 0,
    totalPages: data ? data.totalPages : 0,
    averageRating: data ? data.averageRating : 0,
    isLoading,
    error,

    /* - Mutations - */

    postReviewMutation,
    updateReviewMutation,
    deleteReviewMutation,
  };
};

export { useReviews };
