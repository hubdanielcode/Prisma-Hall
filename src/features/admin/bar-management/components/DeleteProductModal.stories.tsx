import { DeleteProductModal } from "@/features/admin/bar-management/components/DeleteProductModal";
import { fakeProduct } from "../../../../../.storybook/mocks/useProducts";
import { MobileProvider } from "@/shared/context/MobileContext";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: DeleteProductModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <MobileProvider>
      <DeleteProductModal
        isOpen={true}
        onClose={() => {}}
        product={fakeProduct}
      />
    </MobileProvider>
  );
};

export { DeleteModal as "Delete Product Modal" };
