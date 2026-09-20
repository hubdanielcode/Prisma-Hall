import { BarProvider } from "@/features/bar/context/BarContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { ProductsManagementCard } from "./ProductsManagementCard";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management",
  component: ProductsManagementCard,
  parameters: {
    layout: "fullscreen",
  },
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
