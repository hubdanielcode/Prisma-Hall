import { BarProvider, ProductsProvider } from "@/features/bar";
import { ProductsManagementTable } from "./ProductsManagementTable";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Bar Management/Table",
  component: ProductsManagementTable,
};

const TableData = () => {
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

export { TableData as "Products Table Data" };
