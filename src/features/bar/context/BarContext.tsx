"use client";

import { Beer, Coffee, Martini, Wine } from "lucide-react";
import { createContext, useState } from "react";
import { useProductsContext } from "../hooks/useProductsContext";
import { type CategoryProps } from "../types/category";
import type { ProductProps } from "../types/product";

interface BarContextType {
  /* - Dados dos produtos - */

  filteredProducts: ProductProps[];
  productsCategories: CategoryProps[];
  isLoading: boolean;
  error: string;

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

  const { products, isLoading, error } = useProductsContext();

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState("Todos");

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Definições - */

  const productsCategories: CategoryProps[] = [
    { id: "Todos", name: "Todos", icon: Wine },
    { id: "Coquetéis", name: "Coquetéis", icon: Martini },
    { id: "Cervejas", name: "Cervejas", icon: Beer },
    { id: "Drinks", name: "Drinks", icon: Wine },
    { id: "Sem Álcool", name: "Sem Álcool", icon: Coffee },
  ];

  const filteredProducts = products.filter((product) => {
    const matchingNames = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchingCategories =
      selectedCategory === "Todos" || product.category === selectedCategory;

    return matchingNames && matchingCategories;
  });

  return (
    <BarContext.Provider
      value={{
        /* - Dados dos produtos - */

        filteredProducts,
        productsCategories,
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
