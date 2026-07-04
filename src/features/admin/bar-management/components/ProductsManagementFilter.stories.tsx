import { BarProvider } from "@/features/bar";
import { ProductsManagementFilter } from "./ProductsManagementFilter";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementFilter,
};

const Filter = () => {
  return (
    <BarProvider>
      <MobileProvider>
        <ProductsManagementFilter />
      </MobileProvider>
    </BarProvider>
  );
};

export { Filter };
