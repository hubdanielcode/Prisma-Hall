"use client";

import { getEventPictures, likeEventPicture as likeEventPictureAction } from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useGallery = () => {
  const queryClient = useQueryClient();

  /* - Query de leitura - */

  const { data, isLoading, error } = useQuery({ queryKey: ["gallery"], queryFn: getEventPictures });

  /* - Definições - */

  const pictures = data ?? [];

  /* - Mutations - */

  // 1. LikePictureMutation

  const { mutateAsync: likePictureMutation } = useMutation({
    mutationFn: likeEventPictureAction,
    onSuccess: async (likePictureMutationResult) => {
      if (likePictureMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    pictures,
    isLoading,
    error,

    /* - Mutations - */

    likePictureMutation,
  };
};

export { useGallery };
