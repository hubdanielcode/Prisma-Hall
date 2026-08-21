import { CreateProductModal } from "./CreateProductModal";
import { BarProvider, ProductsProvider } from "@/features/bar";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Admin Page/Bar Management/Modals",
  component: CreateProductModal,
};

const CreateModal = () => {
  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <CreateProductModal
            isOpen={true}
            onClose={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { CreateModal as "Create Modal" };
