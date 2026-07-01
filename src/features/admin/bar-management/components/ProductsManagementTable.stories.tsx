import { BarProvider } from "@/features/bar";
import { ProductsManagementTable } from "./ProductsManagementTable";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementTable,
};

const Table = () => {
  return (
    <BarProvider>
      <ProductsManagementTable />
    </BarProvider>
  );
};

export { Table };
