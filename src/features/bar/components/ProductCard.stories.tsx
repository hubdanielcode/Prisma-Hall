import { fakeProduct } from "../../../../.storybook/mocks/hooks/bar/useProducts";
import { Plus } from "lucide-react";
import { ProductCard } from "./ProductCard";

export default {
  title: "Layouts/Public/Home Page/Bar",
  component: ProductCard,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Card = () => {
  return (
    <ProductCard
      product={fakeProduct}
      index={0}
      description={fakeProduct.description}
      footer={
        <div className="flex justify-between items-center mx-5 mt-2 mb-4">
          <span className="text-xl text-[#B8860B] font-bold">R$ {fakeProduct.price.toFixed(2)}</span>

          <button
            className="flex justify-center items-center px-4 py-2 text-[#B8860B] font-semibold bg-[#3D2B0A] backdrop-blur-sm border border-[#B8860B] rounded-lg cursor-pointer hover:shadow-sm shadow-[#DDAE56]"
            type="button"
          >
            <Plus className="w-5 h-5 mr-1" />
            Comprar
          </button>
        </div>
      }
    />
  );
};

export { Card as "Product Card" };
