import { Beer, Coffee, Martini, Wine } from "lucide-react";
import { createContext, useState } from "react";
import { type ProductProps } from "../types/product";
import { useProducts } from "../hooks/useProducts";
import type { CategoryProps } from "../types/category";

interface BarContextType {
  /* - Estados dos produtos - */

  products: ProductProps[];
  filteredProducts: ProductProps[];
  productsCategories: CategoryProps[];
  isLoading: boolean;
  error: string | null;

  /* - Estados de categoria - */

  selectedCategory: string;
  setSelectedCategory: (selectedCategory: string) => void;
}

const BarContext = createContext<BarContextType | null>(null);

const BarProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Estados de produtos - */

  const { products, isLoading, error } = useProducts();

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  /* - Definições - */

  const productsCategories: CategoryProps[] = [
    { id: "todos", name: "Todos", icon: Wine },
    { id: "Coquetéis", name: "Coquetéis", icon: Martini },
    { id: "Cervejas", name: "Cervejas", icon: Beer },
    { id: "Drinks", name: "Drinks", icon: Wine },
    { id: "Sem Álcool", name: "Sem Álcool", icon: Coffee },
  ];

  const filteredProducts =
    selectedCategory === "todos"
      ? products
      : products.filter((product) => selectedCategory === product.category);

  return (
    <BarContext.Provider
      value={{
        /* - Estados dos produtos - */

        products,
        filteredProducts,
        productsCategories,
        isLoading,
        error,

        /* - Estados de categoria - */

        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </BarContext.Provider>
  );
};

export { BarContext, BarProvider };
