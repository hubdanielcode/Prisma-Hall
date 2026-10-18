"use client";

import {
  createProduct as createProductAction,
  deleteProduct as deleteProductAction,
  editProduct as editProductAction,
  getAllProductsUsers,
  getAllProductsAdmins,
} from "@/actions";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ProductProps } from "../types/product";
import { usePathname } from "next/navigation";

const useProducts = () => {
  const queryClient = useQueryClient();

  /* - Estados dos produtos - */

  const [productBeingEdited, setProductBeingEdited] = useState<ProductProps | null>(null);
  const [productBeingDeleted, setProductBeingDeleted] = useState<ProductProps | null>(null);

  /* - Definições - */

  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  const productQueryKey = {
    admin: "adminProduct",
    user: "userProduct",
  };

  const invalidateAllProductQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [productQueryKey.admin] }),
      queryClient.invalidateQueries({ queryKey: [productQueryKey.user] }),
    ]);
  };

  /* - Query de leitura - */

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: [isAdminArea ? productQueryKey.admin : productQueryKey.user],
    queryFn: () => (isAdminArea ? getAllProductsAdmins() : getAllProductsUsers()),
  });

  /* - Mutations - */

  // 1. CreateProductMutation

  const { mutateAsync: createProductMutation } = useMutation({
    mutationFn: createProductAction,
    onSuccess: async (createProductMutationResult) => {
      if (typeof createProductMutationResult === "object") {
        await invalidateAllProductQueries();
      }
    },
  });

  // 2. EditProductMutation

  const { mutateAsync: editProductMutation } = useMutation({
    mutationFn: editProductAction,
    onSuccess: async (editProductMutationResult) => {
      if (typeof editProductMutationResult === "object") {
        await invalidateAllProductQueries();
      }
    },
  });

  // 3. DeleteProductMutation

  const { mutateAsync: deleteProductMutation } = useMutation({
    mutationFn: deleteProductAction,
    onSuccess: async (deleteProductMutationResult) => {
      if (deleteProductMutationResult === true) {
        await invalidateAllProductQueries();
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
