import { createContext, useState, useEffect } from "react";
import type { ProductProps } from "@/features/bar";
import {
  createProduct as createProductService,
  getProducts as getProductsService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from "@/features/bar";

interface BarManagementContextType {
  /* - Produtos - */

  products: ProductProps[];

  /* - Carregamento - */

  isLoading: boolean;

  /* - Erro - */

  error: string;

  /* - Funções - */

  createProduct: (
    product: Omit<ProductProps, "created_at" | "product_id">,
  ) => Promise<ProductProps>;
  updateProduct: (
    productId: string,
    updates: Partial<Omit<ProductProps, "created_at" | "product_id">>,
  ) => Promise<ProductProps>;
  deleteProduct: (productId: string) => Promise<void>;
}

const BarManagementContext = createContext<BarManagementContextType | null>(
  null,
);

const BarManagementProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Estados dos produtos - */

  const [products, setProducts] = useState<ProductProps[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string>("");

  /* - Funções - */

  // 1. Busca a lista de produtos no momento da renderização da página

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsService();
        setProducts(data);
      } catch (caughtError) {
        console.log("caughtError:", caughtError);
        setError("Erro ao buscar a lista de produtos disponíveis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Permite que o admin adicione um novo produto no cardápio

  const createProduct = async (
    product: Omit<ProductProps, "created_at" | "product_id">,
  ) => {
    try {
      setError("");
      const newProduct = await createProductService({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        image: product.image,
        status: product.status,
      });
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (caughtError) {
      setError("Erro ao adicionar novo produto ao cardápio");
      throw caughtError;
    }
  };

  // 3. Permite que o admin atualize um produto no cardápio

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<ProductProps, "created_at" | "product_id">>,
  ) => {
    try {
      setError("");
      const updatedProduct = await updateProductService(productId, updates);
      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId ? updatedProduct : product,
        ),
      );
      return updatedProduct;
    } catch (caughtError) {
      setError("Erro ao atualizar produto");
      throw caughtError;
    }
  };

  // 4. Permite que o admin delete um produto do cardápio

  const deleteProduct = async (productId: string) => {
    try {
      setError("");
      await deleteProductService(productId);
      setProducts((prev) =>
        prev.filter((product) => product.product_id !== productId),
      );
    } catch (caughtError) {
      setError("Erro ao remover produto do cardápio");
      throw caughtError;
    }
  };

  return (
    <BarManagementContext.Provider
      value={{
        /* - Produtos - */

        products,

        /* - Carregamento - */

        isLoading,

        /* - Erro - */

        error,

        /* - Funções - */

        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </BarManagementContext.Provider>
  );
};

export { BarManagementContext, BarManagementProvider };
