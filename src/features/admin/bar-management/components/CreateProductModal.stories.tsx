import { BarProvider } from "@/features/bar/context/BarContext";

import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { CreateProductModal } from "./CreateProductModal";

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
