import { BarProvider, ProductsProvider } from "@/features/bar";
import { EditProductModal } from "./EditProductModal";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: EditProductModal,
};

const EditModal = () => {
  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <EditProductModal
            isOpen={true}
            onClose={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { EditModal as "Edit Product Modal" };
