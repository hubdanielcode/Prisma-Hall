import { BarProvider } from "@/features/bar";
import { ProductsManagementTable } from "./ProductsManagementTable";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementTable,
};

const Table = () => {
  return (
    <BarProvider>
      <MobileProvider>
        <ProductsManagementTable />
      </MobileProvider>
    </BarProvider>
  );
};

export { Table };
