import { NewProductModal } from "@/features/admin/bar-management/components/NewProductModal";
import { BarProvider } from "@/features/bar";

export default {
  title: "Admin/Bar-Management",
  component: NewProductModal,
};

const Modal = () => {
  return (
    <BarProvider>
      <NewProductModal
        isOpen={true}
        onClose={() => {}}
      />
    </BarProvider>
  );
};

export { Modal };
