import { BarProvider, ProductsProvider } from "@/features/bar";
import { ProductsManagementCard } from "./ProductsManagementCard";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Bar Management",
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

export { ProductCards as "Products Cards" };
