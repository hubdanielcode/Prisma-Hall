"use client";

import { AttractionProps } from "../types/attraction";
import {
  createAttraction as createAttractionAction,
  editAttraction as editAttractionAction,
  deleteAttraction as deleteAttractionAction,
  getAllAttractions,
} from "@/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const useAttractions = () => {
  const queryClient = useQueryClient();

  /* - Esttados das atrações - */

  const [attractionBeingEdited, setAttractionBeingEdited] = useState<AttractionProps | null>(null);
  const [attractionBeingDeleted, setAttractionBeingDeleted] = useState<AttractionProps | null>(null);

  /* - Query de leitura - */

  const { data: attractions, isLoading, error } = useQuery({ queryKey: ["attractions"], queryFn: getAllAttractions });

  /* - Mutations - */

  // 1. CreateAttractionMutation

  const { mutateAsync: createAttractionMutation } = useMutation({
    mutationFn: createAttractionAction,
    onSuccess: async (createAttractionMutationResult) => {
      if (createAttractionMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["attractions"] });
      }
    },
  });

  // 2. EditAttractionMutation

  const { mutateAsync: editAttractionMutation } = useMutation({
    mutationFn: editAttractionAction,
    onSuccess: async (editAttractionActionReult) => {
      if (editAttractionActionReult) {
        queryClient.invalidateQueries({ queryKey: ["attractions"] });
      }
    },
  });

  // 3.DeleteAttractionMutation

  const { mutateAsync: deleteAttractionMutation } = useMutation({
    mutationFn: deleteAttractionAction,
    onSuccess: async (deleteAttractionMutationResult) => {
      if (deleteAttractionMutationResult === true) {
        queryClient.invalidateQueries({ queryKey: ["attractions"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    attractions,
    isLoading,
    error,

    /* - Mutations - */

    createAttractionMutation,
    editAttractionMutation,
    deleteAttractionMutation,

    /* - Estados dos eventos - */

    attractionBeingEdited,
    setAttractionBeingEdited,
    attractionBeingDeleted,
    setAttractionBeingDeleted,
  };
};

export { useAttractions };
