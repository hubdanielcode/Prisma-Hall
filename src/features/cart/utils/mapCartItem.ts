import type { Cart, Event, Product } from "@/prisma/generated/prisma/client";
import { getEventStatus } from "@/lib/server/events/getEventStatus";

type CartItemWithRelations = Cart & {
  product: Product | null;
  event: (Event & { attraction: { name: string } }) | null;
};

/* - Converte o item do carrinho vindo do Prisma (Decimal e Date) em dados que podem chegar no client - */

const mapCartItem = (cartItem: CartItemWithRelations) => ({
  id: cartItem.id,
  type: cartItem.type,
  productId: cartItem.productId,
  eventId: cartItem.eventId,
  quantity: cartItem.quantity,
  price: (cartItem.product ? cartItem.product.price : cartItem.event ? cartItem.event.price : cartItem.price).toNumber(),

  product: cartItem.product
    ? {
        id: cartItem.product.id,
        name: cartItem.product.name,
        category: cartItem.product.category,
        image: cartItem.product.image,
        quantity: cartItem.product.quantity,
        status: cartItem.product.status,
      }
    : null,

  event: cartItem.event
    ? {
        id: cartItem.event.id,
        title: cartItem.event.title,
        attractionName: cartItem.event.attraction.name,
        image: cartItem.event.image,
        startsAt: cartItem.event.startsAt.toISOString(),
        status: getEventStatus(cartItem.event),
      }
    : null,

  createdAt: cartItem.createdAt.toISOString(),
  updatedAt: cartItem.updatedAt.toISOString(),
});

export { mapCartItem };
