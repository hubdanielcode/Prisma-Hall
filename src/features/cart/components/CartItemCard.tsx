import { formattedDate } from "@/shared/utils/functions/dates";
import { masks } from "@/shared/utils/functions/masks";
import type { CartItemProps } from "../types/cartItem";

interface CartItemCardProps {
  item: CartItemProps;
  handleIncreaseItemQuantity: (item: CartItemProps) => void;
  handleDecreaseItemQuantity: (item: CartItemProps) => void;
}

const CartItemCard = ({ item, handleIncreaseItemQuantity, handleDecreaseItemQuantity }: CartItemCardProps) => {
  /* - Definições - */

  const date = item.type === "tickets" && item.event ? formattedDate(item.event.startsAt) : null;
  const image = item.type === "tickets" ? item.event?.image : item.product?.image;
  const title = item.type === "tickets" ? item.event?.title : item.product?.name;

  // 1. Bebida não passa do estoque. Ingresso não tem limite de quantidade

  const hasReachedStockLimit = item.type === "drinks" && item.product ? item.quantity >= item.product.quantity : false;

  return (
    <div className="flex items-center gap-3 px-3 py-3 bg-black/80 border border-[#B8860B60] rounded-lg w-[90%]">
      {/* - Foto do item - */}

      <div className="flex h-13 w-13 rounded-lg border border-[#B8860B60] mx-1">
        <img
          className="object-center object-cover rounded-lg"
          src={image}
          alt={title}
        />
      </div>

      {/* - Informações - */}

      <div className="flex flex-col flex-1 mt-1">
        {/* - Título - */}

        <span className="text-white/80 text-sm font-bold truncate">{title}</span>

        {/* - Linha exclusiva - */}

        {date && (
          <span className="text-[#B8860B] text-xs font-semibold">
            {date.dayName.charAt(0).toUpperCase() + date.dayName.slice(1).toLowerCase()}, {date.dayNumber} de {date.month} às {date.time}
          </span>
        )}

        {item.type === "drinks" && item.product && (
          <span className="text-[#B8860B] text-xs font-semibold">{masks.productCategory(item.product.category)}</span>
        )}

        {/* - Preço e quantidade - */}

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[#B8860B] text-base font-bold">R$ {item.price.toFixed(2).replace(".", ",")}</span>

          <div className="flex items-center gap-1.5">
            <button
              className="flex items-center justify-center w-5 h-5 text-[#B8860B] hover:text-[#DDAE56] text-sm bg-black hover:bg-[#0A0A0A] border border-[#B8860B60] rounded pb-0.5 cursor-pointer"
              onClick={() => handleDecreaseItemQuantity(item)}
            >
              -
            </button>

            <span className="text-white/80 text-sm font-bold w-4 text-center">{item.quantity}</span>

            <button
              className="flex items-center justify-center w-5 h-5 text-[#B8860B] hover:text-[#DDAE56] text-sm bg-black hover:bg-[#0A0A0A] border border-[#B8860B60] rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={hasReachedStockLimit}
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
