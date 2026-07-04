import { BarProvider } from "@/features/bar";
import { ProductsManagementCard } from "./ProductsManagementCard";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Bar-Management",
  component: ProductsManagementCard,
};

const Cards = () => {
  return (
    <BarProvider>
      <MobileProvider>
        <ProductsManagementCard />
      </MobileProvider>
    </BarProvider>
  );
};

export { Cards };
