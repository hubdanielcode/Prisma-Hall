import { BarProvider } from "@/features/bar";
import { ProductsManagementCard } from "./ProductsManagementCard";
import { MobileProvider } from "@/shared";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management",
  component: ProductsManagementCard,
};

const ProductCards = () => {
  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <ProductsManagementCard />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { ProductCards as "Products Cards" };
