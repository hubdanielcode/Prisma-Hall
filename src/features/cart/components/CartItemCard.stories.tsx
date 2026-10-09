import { fakeCartItems } from "../../../../.storybook/mocks/hooks/cart/useCartItems";
import { CartItemCard } from "./CartItemCard";

export default {
  title: "Layouts/Protected/Cart",
  component: CartItemCard,
  parameters: {
    layout: "centered",
  },
};

const TicketCard = () => {
  return (
    <div className="flex justify-center w-85 py-4 bg-black">
      <CartItemCard
        item={fakeCartItems[0]}
        handleIncreaseItemQuantity={() => {}}
        handleDecreaseItemQuantity={() => {}}
      />
    </div>
  );
};

const DrinkCard = () => {
  return (
    <div className="flex justify-center w-85 py-4 bg-black">
      <CartItemCard
        item={fakeCartItems[1]}
        handleIncreaseItemQuantity={() => {}}
        handleDecreaseItemQuantity={() => {}}
      />
    </div>
  );
};

export { TicketCard as "Ticket Item Card", DrinkCard as "Drink Item Card" };
