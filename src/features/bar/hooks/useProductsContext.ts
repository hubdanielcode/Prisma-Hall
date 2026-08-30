import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext";

const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error(
      "useProductsContext must be used within a ProductsProvider",
    );
  }
  return context;
};

export { useProductsContext };
