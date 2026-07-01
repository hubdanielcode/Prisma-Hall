import { useBarContext } from "@/features/bar";
import { Beer, Coffee, Martini, Wine } from "lucide-react";

const ProductsManagementCard = () => {
  /* - Puxando do context - */

  const { products } = useBarContext();

  /* - Definições - */

  const cardData = {
    Todos: {
      icon: <Wine />,
      title: "Total de produtos",
      quantity: products.length,
    },

    Coquetéis: {
      icon: <Martini />,
      title: "Coquetéis",
      quantity: products.filter((product) => product.category === "Coquetéis")
        .length,
    },

    Drinks: {
      icon: <Wine />,
      title: "Drinks",
      quantity: products.filter((product) => product.category === "Drinks")
        .length,
    },

    Cervejas: {
      icon: <Beer />,
      title: "Cervejas",
      quantity: products.filter((product) => product.category === "Cervejas")
        .length,
    },

    "Sem Álcool": {
      icon: <Coffee />,
      title: "Sem Álcool",
      quantity: products.filter((product) => product.category === "Sem Álcool")
        .length,
    },
  };

  const uniqueCategories = [
    ...new Set(products.map((product) => product.category)),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:items-stretch sm:gap-3 md:flex md:flex-nowrap md:items-stretch md:gap-4 w-full ">
      {/* - Card de total de produtos - */}

      <div className="col-span-2 sm:flex-1 md:flex-1 bg-black border border-[#B8860B] rounded-lg h-25 md:h-29 p-4">
        <div className="flex flex-col justify-center items-center">
          <div className="flex gap-3 sm:gap-2 text-[#B8860B]">
            {/* - Ícone + título - */}

            <span>
              <Wine />
            </span>

            <span className="text-white/60 font-semibold text-nowrap text-xs sm:text-[10px] md:text-xs tracking-wider uppercase pt-1">
              Total de produtos
            </span>
          </div>

          {/* - Quantidade - */}

          <span className="flex items-center justify-center text-white text-2xl sm:text-xl md:text-3xl font-bold pt-1">
            {products.length}
          </span>
        </div>
      </div>

      {/* - Card de cada categoria - */}

      {uniqueCategories.map((category) => {
        const card = cardData[category as keyof typeof cardData];

        return (
          <div
            className="col-span-1 sm:flex-1 md:flex-1 bg-black border border-[#B8860B] rounded-lg h-25 md:h-29 p-4 sm:p-3 md:p-6"
            key={category}
          >
            <div className="flex flex-col justify-center items-center">
              <div className="flex gap-3 sm:gap-2 text-[#B8860B]">
                {/* - Ícone + título - */}

                {card.icon}
                <span className="text-white/60 font-semibold text-nowrap text-xs sm:text-[10px] md:text-xs tracking-wider uppercase pt-1">
                  {card.title}
                </span>
              </div>

              {/* - Quantidade - */}

              <span className="flex items-center justify-center text-white text-2xl sm:text-xl md:text-3xl font-bold pt-1">
                {card.quantity}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { ProductsManagementCard };
