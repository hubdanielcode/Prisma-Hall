import { BarProvider } from "@/features/bar";
import { ProductsManagementTable } from "./ProductsManagementTable";
import { MobileProvider } from "@/shared";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Table",
  component: ProductsManagementTable,
};

const TableData = () => {
  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementTable
            currentPage={1}
            onPageChange={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { TableData as "Products Table Data" };
