import { BarProvider, ProductsProvider } from "@/features/bar";
import { ProductsManagementTable } from "./ProductsManagementTable";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Admin Page/Bar Management",
  component: ProductsManagementTable,
};

const ProductTable = () => {
  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementTable
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { ProductTable as Table };
