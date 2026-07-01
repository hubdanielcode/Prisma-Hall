import { BarProvider } from "@/features/bar";
import { ProductsManagementFilter } from "./ProductsManagementFilter";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementFilter,
};

const Filter = () => {
  return (
    <BarProvider>
      <ProductsManagementFilter />
    </BarProvider>
  );
};

export { Filter };
