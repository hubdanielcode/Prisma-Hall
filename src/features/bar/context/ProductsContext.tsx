"use client";

import { createContext, useState, useEffect } from "react";
import {
  createProduct as createProductService,
  getProducts as getProductsService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from "../services/productsServices";
import type { ProductProps } from "../types/product";

interface ProductsContextType {
  /* - Dados dos produtos - */

  products: ProductProps[];
  productBeingEdited: ProductProps | null;
  setProductBeingEdited: (productBeingEdited: ProductProps | null) => void;
  productBeingDeleted: ProductProps | null;
  setProductBeingDeleted: (productBeingDeleted: ProductProps | null) => void;
  isLoading: boolean;
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

const ProductsContext = createContext<ProductsContextType | null>(null);

const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Estados dos produtos - */

  const [products, setProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [productBeingEdited, setProductBeingEdited] = useState<ProductProps | null>(null);
  const [productBeingDeleted, setProductBeingDeleted] = useState<ProductProps | null>(null);

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

  const createProduct = async (product: Omit<ProductProps, "created_at" | "product_id">) => {
    try {
      setError("");

      const newProduct = await createProductService(product);

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
        prev.map((product) => (product.product_id === productId ? updatedProduct : product)),
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

      setProducts((prev) => prev.filter((product) => product.product_id !== productId));
    } catch (caughtError) {
      setError("Erro ao remover produto do cardápio");
      throw caughtError;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        /* - Dados dos produtos - */

        products,
        productBeingEdited,
        setProductBeingEdited,
        productBeingDeleted,
        setProductBeingDeleted,
        isLoading,
        error,

        /* - Funções - */

        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export { ProductsContext, ProductsProvider };
