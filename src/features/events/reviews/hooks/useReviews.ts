"use client";

import { deleteReview as deleteReviewAction, getAllReviews, postReview as postReviewAction, updateReview as updateReviewAction } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useReviews = () => {
  const queryClient = useQueryClient();

  /* - Query de leitura - */

  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews"],
    queryFn: getAllReviews,
  });

  /* - Definições - */

  const reviews = Array.isArray(data) ? data : [];

  const averageRating = reviews.length > 0 ? reviews.reduce((accumulator, review) => accumulator + review.rating, 0) / reviews.length : 0;

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
      if (updateReviewMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    },
  });

  // 3. DeleteReviewMutation

  const { mutateAsync: deleteReviewMutation } = useMutation({
    mutationFn: deleteReviewAction,
    onSuccess: async (deleteReviewMutationResult) => {
      if (deleteReviewMutationResult) {
        await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    reviews,
    averageRating,
    isLoading,
    error,

    /* - Mutations - */

    postReviewMutation,
    updateReviewMutation,
    deleteReviewMutation,
  };
};

export { useReviews };
