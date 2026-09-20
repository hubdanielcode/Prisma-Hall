import { BarProvider } from "@/features/bar/context/BarContext";
import { CreateProductModal } from "./CreateProductModal";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: CreateProductModal,
  parameters: {
    layout: "fullscreen",
  },
};

const CreateModal = () => {
  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <CreateProductModal
            isOpen={true}
            onClose={() => {}}
          />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { CreateModal as "Create Product Modal" };
