import { CreateProductModal } from "./CreateProductModal";
import { BarProvider } from "@/features/bar";
import { MobileProvider } from "@/shared";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: CreateProductModal,
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
