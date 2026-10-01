"use client";

import { createContext, useState } from "react";
import { createProductSchema, editProductSchema } from "@/lib/validations";
import { productCategories } from "../utils/productCategories";
import { productCategoryIcons } from "../utils/productCategoryIcons";
import { useProducts } from "../hooks/useProducts";
import { z } from "zod";
import type { CategoryProps } from "../types/category";
import type { ProductProps } from "../types/product";

interface BarContextType {
  /* - Dados dos produtos - */

  filteredProducts: ProductProps[];
  categories: CategoryProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados de busca - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  /* - Estados de produtos - */

  productBeingEdited: ProductProps | null;
  setProductBeingEdited: (productBeingEdited: ProductProps | null) => void;

  productBeingDeleted: ProductProps | null;
  setProductBeingDeleted: (productBeingDeleted: ProductProps | null) => void;

  selectedCategory: string;
  setSelectedCategory: (selectedCategory: string) => void;

  selectedStatus: "all_status" | "active" | "inactive";
  setSelectedStatus: (selectedStatus: "all_status" | "active" | "inactive") => void;

  /* - Mutations - */

  createProductMutation: (product: z.infer<typeof createProductSchema>) => Promise<unknown>;
  editProductMutation: (product: z.infer<typeof editProductSchema>) => Promise<unknown>;
  deleteProductMutation: (productId: string) => Promise<unknown>;
}

const BarContext = createContext<BarContextType | null>(null);

const BarProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados dos produtos - */

  const {
    products,
    isLoading,
    error,
    productBeingEdited,
    setProductBeingEdited,
    productBeingDeleted,
    setProductBeingDeleted,
    createProductMutation,
    editProductMutation,
    deleteProductMutation,
  } = useProducts();

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Estados dos produtos - */

  const [selectedCategory, setSelectedCategory] = useState("all_categories");
  const [selectedStatus, setSelectedStatus] = useState<"all_status" | "active" | "inactive">("all_status");

  /* - Definições - */

  const possibleCategories = [{ id: "all_categories", title: "Todas as Categorias" }, ...productCategories] as const;

  const categories: CategoryProps[] = possibleCategories.map((category) => ({
    id: category.id,
    title: category.title,
    icon: productCategoryIcons[category.id],
  }));

  const filteredProducts =
    products?.filter((product) => {
      const matchingNames = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchingCategories = selectedCategory === "all_categories" || product.category === selectedCategory;
      const matchingStatus = selectedStatus === "all_status" || product.status === selectedStatus;

      return matchingNames && matchingCategories && matchingStatus;
    }) ?? [];

  return (
    <BarContext.Provider
      value={{
        /* - Dados dos produtos - */

        filteredProducts,
        categories,
        isLoading,
        error,

        /* - Estados de busca - */

        searchQuery,
        setSearchQuery,

        /* - Estados dos produtos - */

        productBeingEdited,
        setProductBeingEdited,

        productBeingDeleted,
        setProductBeingDeleted,

        selectedCategory,
        setSelectedCategory,

        selectedStatus,
        setSelectedStatus,

        /* - Mutations - */

        createProductMutation,
        editProductMutation,
        deleteProductMutation,
      }}
    >
      {children}
    </BarContext.Provider>
  );
};

export { BarContext, BarProvider };
