import { BarProvider, ProductsProvider } from "@/features/bar";
import { ProductsManagementCard } from "./ProductsManagementCard";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Admin Page/Bar Management",
  component: ProductsManagementCard,
};

const ProductCards = () => {
  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementCard />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { ProductCards as Cards };
