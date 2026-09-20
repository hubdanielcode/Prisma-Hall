"use client";

import { createContext, useState } from "react";
import { productCategories } from "@/features/bar/utils/productCategories";
import { productCategoryIcons } from "@/features/bar/utils/productCategoryIcons";
import { useProducts } from "@/features/bar/hooks/useProducts";
import type { CategoryProps } from "@/features/bar/types/category";
import type { ProductProps } from "@/features/bar/types/product";

interface BarContextType {
  /* - Dados dos produtos - */

  filteredProducts: ProductProps[];
  categories: CategoryProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados de categoria - */

  selectedCategory: string;
  setSelectedCategory: (selectedCategory: string) => void;

  /* - Estados de busca - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

const BarContext = createContext<BarContextType | null>(null);

const BarProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados dos produtos - */

  const { products, isLoading, error } = useProducts();

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState("all_categories");

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Definições - */

  const possibleCategories = [{ id: "all_categories", title: "Todos" }, ...productCategories] as const;

  const categories: CategoryProps[] = possibleCategories.map((category) => ({
    id: category.id,
    title: category.title,
    icon: productCategoryIcons[category.id],
  }));

  const filteredProducts =
    products?.filter((product) => {
      const matchingNames = product.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchingCategories = selectedCategory === "all_categories" || product.category === selectedCategory;

      return matchingNames && matchingCategories;
    }) ?? [];

  return (
    <BarContext.Provider
      value={{
        /* - Dados dos produtos - */

        filteredProducts,
        categories,
        isLoading,
        error,

        /* - Estados de categoria - */

        selectedCategory,
        setSelectedCategory,

        /* - Estados de busca - */

        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </BarContext.Provider>
  );
};

export { BarContext, BarProvider };
