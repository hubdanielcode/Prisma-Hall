"use client";

import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useProducts } from "@/features/bar/hooks/useProducts";
import { FaGlassMartini, FaCheckCircle, FaShoppingBag, FaArrowCircleDown } from "react-icons/fa";

const ProductsManagementCard = () => {
  /* - Puxando do context - */

  const { products } = useProducts();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const productList = products ?? [];
  const lowerProductLimit = 6;
  const noneLeft = 0;

  const now = new Date();
  const totalProducts = productList.length;

  const totalCreatedThisMonth = productList.filter((product) => {
    const createdAt = new Date(product.createdAt);

    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }).length;

  const totalActive = productList.filter((product) => product.status === "active").length;
  const totalLowOnStock = productList.filter((product) => product.quantity < lowerProductLimit).length;
  const totalNoneOnStock = productList.filter((product) => product.quantity === noneLeft).length;

  const percentageOfTotal = (quantity: number) => (totalProducts === 0 ? "0% do total" : `${Math.round((quantity / totalProducts) * 100)}% do total`);

  const cardData = [
    {
      id: "all",
      icon: <FaGlassMartini size={24} />,
      message: `+${totalCreatedThisMonth} este mês`,
      title: "Total de produtos",
      quantity: totalProducts,
    },

    {
      id: "active",
      icon: <FaCheckCircle size={24} />,
      message: percentageOfTotal(totalActive),
      title: "Produtos ativos",
      quantity: totalActive,
    },

    {
      id: "low_on_stock",
      icon: <FaShoppingBag size={24} />,
      message: totalLowOnStock > 0 ? "Requer atenção" : "Tudo em dia",
      title: "Estoque baixo",
      quantity: totalLowOnStock,
    },

    {
      id: "none_on_stock",
      icon: <FaArrowCircleDown size={24} />,
      message: percentageOfTotal(totalNoneOnStock),
      title: "Esgotados",
      quantity: totalNoneOnStock,
    },
  ];

  return (
    <div
      className={`w-full ${isPortraitMobile ? "grid grid-cols-2 gap-2" : "flex flex-nowrap items-stretch"} ${isLandscapeMobile ? "gap-3" : "gap-4"}`}
    >
      {cardData.map((card) => (
        <div
          className={`bg-black border border-[#B8860B] rounded-lg w-auto ${
            isPortraitMobile ? "col-span-1 h-32 p-1" : isLandscapeMobile ? "flex-1 h-32 p-0.75" : "flex-1 h-36 p-2"
          }`}
          key={card.id}
        >
          <div className="flex flex-col justify-center w-full">
            {/* - Ícone, mensagem e título - */}

            <div className={`flex flex-col text-[#B8860B] ${isPortraitMobile ? "gap-1" : "gap-1.5"}`}>
              <div className="flex justify-between w-full">
                <span className="w-fit border border-[#B8860B] rounded-lg bg-[#3D2B0A] p-1.5 m-2">{card.icon}</span>

                <span className="text-green-400 text-xs font-semibold text-nowrap tracking-widest uppercase mt-4 ml-auto pr-2">{card.message}</span>
              </div>

              <span
                className={`text-white/60 font-semibold text-nowrap tracking-widest uppercase pt-1 pl-2 ${
                  isPortraitMobile ? "text-[11px]" : isLandscapeMobile ? "text-[9px]" : "text-[11px]"
                }`}
              >
                {card.title}
              </span>
            </div>

            {/* - Quantidade - */}

            <span
              className={`flex items-start justify-start text-white font-bold pt-1 pl-2 ${
                isPortraitMobile ? "text-xl" : isLandscapeMobile ? "text-lg" : "text-2xl"
              }`}
            >
              {card.quantity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export { ProductsManagementCard };
