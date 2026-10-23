"use client";

import {
  createGalleryPicture as createGalleryPictureAction,
  deleteGalleryPicture as deleteGalleryPictureAction,
  editGalleryPicture as editGalleryPictureAction,
  getEventPictures,
  likeEventPicture as likeEventPictureAction,
} from "@/actions";

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

  // 2. CreatePictureMutation

  const { mutateAsync: createPictureMutation } = useMutation({
    mutationFn: createGalleryPictureAction,
    onSuccess: async (createPictureMutationResult) => {
      if (createPictureMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
      }
    },
  });

  // 3. EditPictureMutation

  const { mutateAsync: editPictureMutation } = useMutation({
    mutationFn: editGalleryPictureAction,
    onSuccess: async (editPictureMutationResult) => {
      if (editPictureMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["gallery"] });
      }
    },
  });

  // 4. DeletePictureMutation

  const { mutateAsync: deletePictureMutation } = useMutation({
    mutationFn: deleteGalleryPictureAction,
    onSuccess: async (deletePictureMutationResult) => {
      if (deletePictureMutationResult) {
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
    createPictureMutation,
    editPictureMutation,
    deletePictureMutation,
  };
};

export { useGallery };
