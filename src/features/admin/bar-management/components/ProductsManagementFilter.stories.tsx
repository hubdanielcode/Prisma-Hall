import { BarProvider } from "@/features/bar/context/BarContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProductsManagementFilter } from "./ProductsManagementFilter";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management",
  component: ProductsManagementFilter,
  parameters: {
    layout: "fullscreen",
  },
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
