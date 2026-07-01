import { BarProvider } from "@/features/bar";
import { ProductsManagementCard } from "./ProductsManagementCard";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementCard,
};

const Cards = () => {
  return (
    <BarProvider>
      <ProductsManagementCard />
    </BarProvider>
  );
};

export { Cards };
