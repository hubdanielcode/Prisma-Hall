import { BarProvider } from "@/features/bar/context/BarContext";
import { DeleteProductModal } from "./DeleteProductModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { fakeProduct } from "@/storybook/mocks/hooks/bar/useProducts";

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
