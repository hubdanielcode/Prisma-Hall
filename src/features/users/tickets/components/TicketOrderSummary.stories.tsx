import { fakeTicketOrders } from "../../../../../.storybook/mocks/hooks/users/useTicketOrder";
import { TicketOrderSummary } from "./TicketOrderSummary";

export default {
  title: "Layouts/Protected/User/Tickets",
  component: TicketOrderSummary,
  parameters: {
    layout: "fullscreen",
  },
};

const Summary = () => {
  return (
    <div className="flex justify-center min-h-screen w-full p-10 bg-[#1A1A1A]">
      <div className="w-full max-w-3xl">
        <TicketOrderSummary order={fakeTicketOrders[0]} />
      </div>
    </div>
  );
};

const CancelledSummary = () => {
  return (
    <div className="flex justify-center min-h-screen w-full p-10 bg-[#1A1A1A]">
      <div className="w-full max-w-3xl">
        <TicketOrderSummary order={fakeTicketOrders[1]} />
      </div>
    </div>
  );
};

export { Summary as "Ticket Order Summary", CancelledSummary as "Cancelled Ticket Order Summary" };
