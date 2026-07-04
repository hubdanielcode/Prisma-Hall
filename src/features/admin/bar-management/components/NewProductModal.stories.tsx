import { NewProductModal } from "@/features/admin/bar-management/components/NewProductModal";
import { BarProvider } from "@/features/bar";
import { MobileProvider } from "@/shared";

export default {
  title: "Admin/Bar-Management",
  component: NewProductModal,
};

const Modal = () => {
  return (
    <BarProvider>
      <MobileProvider>
        <NewProductModal
          isOpen={true}
          onClose={() => {}}
        />
      </MobileProvider>
    </BarProvider>
  );
};

export { Modal };
