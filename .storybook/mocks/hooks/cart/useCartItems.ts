import { fakeEvents } from "../events/useEvents";
import { fakeProducts } from "../bar/useProducts";
import { fn } from "storybook/test";
import type { CartItemProps } from "@/features/cart/types/cartItem";

const fakeCartItems: CartItemProps[] = [
  {
    id: "id-do-item-fake-1",
    type: "tickets",
    productId: null,
    eventId: fakeEvents[4].id,
    quantity: 2,
    price: fakeEvents[4].price,

    product: null,

    event: {
      id: fakeEvents[4].id,
      title: fakeEvents[4].title,
      attractionName: fakeEvents[4].attractionName,
      image: fakeEvents[4].image,
      startsAt: fakeEvents[4].startsAt,
      status: fakeEvents[4].status,
    },

    createdAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-01").toISOString(),
  },

  {
    id: "id-do-item-fake-2",
    type: "drinks",
    productId: fakeProducts[0].id,
    eventId: null,
    quantity: 1,
    price: fakeProducts[0].price,

    product: {
      id: fakeProducts[0].id,
      name: fakeProducts[0].name,
      category: fakeProducts[0].category,
      image: fakeProducts[0].image,
      quantity: fakeProducts[0].quantity,
      status: fakeProducts[0].status,
    },

    event: null,

    createdAt: new Date("2026-09-02").toISOString(),
    updatedAt: new Date("2026-09-02").toISOString(),
  },

  {
    id: "id-do-item-fake-3",
    type: "drinks",
    productId: fakeProducts[2].id,
    eventId: null,
    quantity: 2,
    price: fakeProducts[2].price,

    product: {
      id: fakeProducts[2].id,
      name: fakeProducts[2].name,
      category: fakeProducts[2].category,
      image: fakeProducts[2].image,
      quantity: fakeProducts[2].quantity,
      status: fakeProducts[2].status,
    },

    event: null,

    createdAt: new Date("2026-09-03").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString(),
  },
];

const fakeCartItem = fakeCartItems[0];

const useCartItems = () => ({
  cartItems: fakeCartItems,
  isLoading: false,
  error: null,
  addItemToCartMutation: fn(async () => fakeCartItem),
  updateItemQuantityMutation: fn(async () => fakeCartItem),
  removeItemFromCartMutation: fn(async () => true),
  clearCartMutation: fn(async () => true),
  checkoutCartMutation: fn(async () => ({ ticketOrderId: "id-do-pedido-fake-1", voucherOrderId: "id-do-pedido-fake-2" })),
});

export { useCartItems, fakeCartItems, fakeCartItem };
