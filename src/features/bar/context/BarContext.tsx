import { Beer, Coffee, Martini, Wine } from "lucide-react";
import { createContext, useState, useEffect } from "react";
import { getProducts, type ProductProps } from "@/features/bar/";
import { type CategoryProps } from "../types/category";

interface BarContextType {
  /* - Dados dos produtos - */

  products: ProductProps[];
  filteredProducts: ProductProps[];
  productsCategories: CategoryProps[];
  isLoading: boolean;
  error: string | null;

  /* - Estados de categoria - */

  selectedCategory: string;
  setSelectedCategory: (selectedCategory: string) => void;

  /* - Estados de busca - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

const BarContext = createContext<BarContextType | null>(null);

const BarProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Estados dos produtos - */

  const [products, setProducts] = useState<ProductProps[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string | null>(null);

  /* - Estados de categoria - */

  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState<string>("");

  /* - Definições - */

  const productsCategories: CategoryProps[] = [
    { id: "Todos", name: "Todos", icon: Wine },
    { id: "Coquetéis", name: "Coquetéis", icon: Martini },
    { id: "Cervejas", name: "Cervejas", icon: Beer },
    { id: "Drinks", name: "Drinks", icon: Wine },
    { id: "Sem Álcool", name: "Sem Álcool", icon: Coffee },
  ];

  const filteredProducts = products.filter((product) => {
    const matchingNames = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchingCategories =
      selectedCategory === "Todos" || product.category === selectedCategory;

    return matchingNames && matchingCategories;
  });

  /* - Funções - */

  // 1. Busca os produtos na hora da renderização

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await getProducts()) as ProductProps[];
        setProducts(data);
      } catch (error) {
        setError("Erro ao buscar produtos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <BarContext.Provider
      value={{
        /* - Dados dos produtos - */

        products,
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
