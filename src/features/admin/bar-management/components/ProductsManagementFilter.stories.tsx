import { BarProvider, ProductsProvider } from "@/features/bar";
import { ProductsManagementFilter } from "./ProductsManagementFilter";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Bar Management",
  component: ProductsManagementFilter,
};

const ProductFilter = () => {
  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementFilter
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { ProductFilter as "Products Filter" };
