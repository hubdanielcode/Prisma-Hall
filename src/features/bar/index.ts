/* - Components - */

export { BarSection } from "@/features/bar/components/BarSection";
export { ProductCard } from "@/features/bar/components/ProductCard";

/* - Context - */

export { BarContext, BarProvider } from "@/features/bar/context/BarContext";

/* - Hooks - */

export { useBarContext } from "@/features/bar/hooks/useBarContext";
export { useProducts } from "@/features/bar/hooks/useProducts";

/* - Services - */

export {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "@/features/bar/services/productsServices";

/* - Types - */

export { type ProductProps } from "@/features/bar/types/product";
export { type CategoryProps } from "@/features/bar/types/category";
