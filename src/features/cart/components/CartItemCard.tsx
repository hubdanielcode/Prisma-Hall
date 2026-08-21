import { formattedDate } from "@/shared";
import type { CartItem } from "../types/cartItem";

interface CartItemCardProps {
  item: CartItem;
  handleIncreaseItemQuantity: (item: CartItem) => void;
  handleDecreaseItemQuantity: (item: CartItem) => void;
}

const CartItemCard = ({
  item,
  handleIncreaseItemQuantity,
  handleDecreaseItemQuantity,
}: CartItemCardProps) => {
  /* - Definições - */

  const date = item.type === "tickets" ? formattedDate(item.starts_at) : null;

  return (
    <div className="flex items-center gap-3 px-3 py-3 bg-black/80 border border-[#B8860B60] rounded-lg w-[90%]">
      {/* - Foto do item - */}

      <div className="flex h-13 w-13 rounded-lg border border-[#B8860B60] mx-1">
        {item.type === "tickets" ? (
          <img
            className="object-center object-cover rounded-lg"
            src={item.image}
            alt={item.event_name}
          />
        ) : (
          <img
            className="object-center object-cover rounded-lg"
            src={item.image}
            alt={item.name}
          />
        )}
      </div>

      {/* - Informações - */}

      <div className="flex flex-col flex-1 mt-1">
        {/* - Título - */}

        <span className="text-white/80 text-sm font-bold truncate">
          {item.type === "tickets" ? item.title : item.name}
        </span>

        {/* - Linha exclusiva - */}

        {item.type === "tickets" && date && (
          <span className="text-[#B8860B] text-xs font-semibold">
            {date.dayName.charAt(0).toUpperCase() +
              date.dayName.slice(1).toLowerCase()}
            , {date.dayNumber} de {date.month} às {date.time}
          </span>
        )}

        {item.type === "drinks" && (
          <span className="text-[#B8860B] text-xs font-semibold">
            {item.category}
          </span>
        )}

        {/* - Preço e quantidade - */}

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[#B8860B] text-base font-bold">
            R$ {item.price.toFixed(2).replace(".", ",")}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              className="flex items-center justify-center w-5 h-5 text-[#B8860B] hover:text-[#DDAE56] text-sm bg-black hover:bg-[#0A0A0A] border border-[#B8860B60] rounded pb-0.5 cursor-pointer"
              onClick={() => handleDecreaseItemQuantity(item)}
            >
              -
            </button>

            <span className="text-white/80 text-sm font-bold w-4 text-center">
              {item.quantity}
            </span>

            <button
              className="flex items-center justify-center w-5 h-5 text-[#B8860B] hover:text-[#DDAE56] text-sm bg-black hover:bg-[#0A0A0A] border border-[#B8860B60] rounded cursor-pointer"
              onClick={() => handleIncreaseItemQuantity(item)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CartItemCard };
