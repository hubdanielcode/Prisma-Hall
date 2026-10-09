import { PayNowButton } from "./PayNowButton";

export default {
  title: "Layouts/Protected/Cart",
  component: PayNowButton,
  parameters: {
    layout: "centered",
  },
};

const TicketOrder = () => {
  return (
    <div className="flex justify-center w-85 py-4 bg-black">
      <PayNowButton
        type="tickets"
        orderId="b1f2c3d4-0000-4000-8000-000000000001"
      />
    </div>
  );
};

const DrinkOrder = () => {
  return (
    <div className="flex justify-center w-85 py-4 bg-black">
      <PayNowButton
        type="drinks"
        orderId="b1f2c3d4-0000-4000-8000-000000000002"
      />
    </div>
  );
};

export { TicketOrder as "Pay Now Ticket Order", DrinkOrder as "Pay Now Drink Order" };
