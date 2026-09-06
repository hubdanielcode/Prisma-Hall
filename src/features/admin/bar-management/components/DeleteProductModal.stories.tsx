import { BarProvider } from "@/features/bar";
import { DeleteProductModal } from "./DeleteProductModal";
import { MobileProvider } from "@/shared";

import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Bar Management/Modals",
  component: DeleteProductModal,
};

const DeleteModal = () => {
  /* - Criando um produto fake para o DeleteModal não cair no if (!product)  - */

  const fakeProduct = {
    id: "id-do-produto-fake",
    name: "Heineken 600ml",
    description: "Cerveja long neck 600ml, importada, puro malte e sabor suave.",
    category: "beers" as const,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpk0apndmxGFNCTM1yJpeiVlfg8KdIJbeA1CBKau_sHblbOq88LZoFZOs&s=10",
    price: 21,
    status: "active" as const,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const DeleteModalContent = () => {
    const product = fakeProduct;

    if (!product) return <p>Carregando produtos...</p>;

    return (
      <DeleteProductModal
        isOpen={true}
        onClose={() => {}}
        product={fakeProduct}
      />
    );
  };

  return (
    <QueryProvider>
      <BarProvider>
        <MobileProvider>
          <DeleteModalContent />
        </MobileProvider>
      </BarProvider>
    </QueryProvider>
  );
};

export { DeleteModal as "Delete Product Modal" };
