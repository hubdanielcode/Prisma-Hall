import { BarProvider } from "@/features/bar";
import { ProductsManagementFilter } from "./ProductsManagementFilter";
import { MobileProvider } from "@/shared";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management",
  component: ProductsManagementFilter,
};

const ProductFilter = () => {
  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementFilter
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { ProductFilter as "Products Filter" };
