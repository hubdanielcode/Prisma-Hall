import { getProducts, type ProductProps } from "@/features/bar/";
import { useState, useEffect } from "react";

const useProducts = () => {
  /* - Estados dos produtos - */

  const [products, setProducts] = useState<ProductProps[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string | null>(null);

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

  return { products, isLoading, error };
};

export { useProducts };
