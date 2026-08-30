/* - Components - */

export { BarSection } from "@/features/bar/components/BarSection";
export { ProductCard } from "@/features/bar/components/ProductCard";

/* - Context - */

export { BarContext, BarProvider } from "@/features/bar/context/BarContext";
export { ProductsContext, ProductsProvider } from "@/features/bar/context/ProductsContext";

/* - Hooks - */

export { useBarContext } from "@/features/bar/hooks/useBarContext";
export { useProductsContext } from "@/features/bar/hooks/useProductsContext";

/* - Services - */

export {
  createProduct as createProductService,
  getProducts as getProductsService,
  getSingleProduct as getSingleProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from "@/features/bar/services/productsServices";

/* - Types - */

export { type ProductProps } from "@/features/bar/types/product";
export { type CategoryProps } from "@/features/bar/types/category";
