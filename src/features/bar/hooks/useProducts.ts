"use client";

import {
  createProduct as createProductAction,
  deleteProduct as deleteProductAction,
  editProduct as editProductAction,
  getAllProducts,
} from "@/actions";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ProductProps } from "../types/product";

const useProducts = () => {
  const queryClient = useQueryClient();

  /* - Estados dos produtos - */

  const [productBeingEdited, setProductBeingEdited] = useState<ProductProps | null>(null);
  const [productBeingDeleted, setProductBeingDeleted] = useState<ProductProps | null>(null);

  /* - Query de leitura - */

  const { data: products, isLoading, error } = useQuery({ queryKey: ["products"], queryFn: getAllProducts });

  /* - Mutations - */

  // 1. CreateProductMutation

  const { mutateAsync: createProductMutation } = useMutation({
    mutationFn: createProductAction,
    onSuccess: async (createProductMutationResult) => {
      if (createProductMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },
  });

  // 2. EditProductMutation

  const { mutateAsync: editProductMutation } = useMutation({
    mutationFn: editProductAction,
    onSuccess: async (editProductMutationResult) => {
      if (editProductMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },
  });

  // 3. DeleteProductMutation

  const { mutateAsync: deleteProductMutation } = useMutation({
    mutationFn: deleteProductAction,
    onSuccess: async (deleteProductMutationResult) => {
      if (deleteProductMutationResult) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    },
  });

  return {
    /* - Query de leitura - */

    products,
    isLoading,
    error,

    /* - Mutations - */

    createProductMutation,
    editProductMutation,
    deleteProductMutation,

    /* - Estados dos produtos - */

    productBeingEdited,
    setProductBeingEdited,
    productBeingDeleted,
    setProductBeingDeleted,
  };
};

export { useProducts };
