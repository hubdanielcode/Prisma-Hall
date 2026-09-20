import { BarProvider } from "@/features/bar/context/BarContext";
import { EditProductModal } from "./EditProductModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: EditProductModal,
  parameters: {
    layout: "fullscreen",
  },
};

const EditModal = () => {
  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <EditProductModal
            isOpen={true}
            onClose={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { EditModal as "Edit Product Modal" };
