import { BarProvider, ProductsProvider, useProductsContext } from "@/features/bar";
import { DeleteProductModal } from "./DeleteProductModal";
import { MobileProvider } from "@/shared";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: DeleteProductModal,
};

const DeleteModal = () => {
  const DeleteModalContent = () => {
    const { products } = useProductsContext();
    const product = products?.[0];

    if (!product) return <p>Carregando produtos...</p>;

    return (
      <DeleteProductModal
        isOpen={true}
        onClose={() => {}}
        product={product}
      />
    );
  };

  return (
    <ProductsProvider>
      <BarProvider>
        <MobileProvider>
          <DeleteModalContent />
        </MobileProvider>
      </BarProvider>
    </ProductsProvider>
  );
};

export { DeleteModal as "Delete Product Modal" };
