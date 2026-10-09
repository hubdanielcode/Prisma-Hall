import type { Cart, Event, Product } from "@/prisma/generated/prisma/client";

type CartItemWithRelations = Cart & {
  product: Product | null;
  event: Event | null;
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
        attractionName: cartItem.event.attractionName,
        image: cartItem.event.image,
        startsAt: cartItem.event.startsAt.toISOString(),
        status: cartItem.event.status,
      }
    : null,

  createdAt: cartItem.createdAt.toISOString(),
  updatedAt: cartItem.updatedAt.toISOString(),
});

export { mapCartItem };
