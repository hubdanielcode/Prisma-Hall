"use client";

import { Martini, PackageX, PackageSearch, CircleCheck } from "lucide-react";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useProducts } from "@/features/bar/hooks/useProducts";

const ProductsManagementCard = () => {
  /* - Puxando do context - */

  const { products } = useProducts();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const productList = products ?? [];
  const lowerProductLimit = 6;
  const noneLeft = 0;

  const cardData = [
    {
      id: "all",
      icon: <Martini />,
      message: "+3 este mês",
      title: "Total de produtos",
      quantity: productList.length,
    },

    {
      id: "active",
      icon: <CircleCheck />,
      message: "86% do total",
      title: "Produtos ativos",
      quantity: productList.filter((product) => product.status === "active").length,
    },

    {
      id: "low_on_stock",
      icon: <PackageSearch />,
      message: "Requer atenção",
      title: "Estoque baixo",
      quantity: productList.filter((product) => product.quantity < lowerProductLimit).length,
    },

    {
      id: "none_on_stock",
      icon: <PackageX />,
      message: "+12,5%",
      title: "Esgotados",
      quantity: productList.filter((product) => product.quantity === noneLeft).length,
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
