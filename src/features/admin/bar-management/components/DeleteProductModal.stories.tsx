import { BarProvider } from "@/features/bar";
import { DeleteProductModal } from "@/features/admin/bar-management/components/DeleteProductModal";
import { fakeProduct } from "../../../../../.storybook/mocks/hooks/bar/useProducts";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: DeleteProductModal,
  parameters: {
    layout: "fullscreen",
  },
};

const DeleteModal = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <BarProvider>
          <DeleteProductModal
            isOpen={true}
            onClose={() => {}}
            product={fakeProduct}
          />
        </BarProvider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Product Modal" };
