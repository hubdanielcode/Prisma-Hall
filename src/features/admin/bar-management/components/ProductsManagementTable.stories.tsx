import { BarProvider } from "@/features/bar/context/BarContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProductsManagementTable } from "./ProductsManagementTable";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Table",
  component: ProductsManagementTable,
  parameters: {
    layout: "fullscreen",
  },
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
