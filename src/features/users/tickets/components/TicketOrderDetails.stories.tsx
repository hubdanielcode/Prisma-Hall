import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { fakeTicketOrder } from "@/storybook/mocks/hooks/users/tickets/useTicketOrder";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { TicketOrderDetails } from "./TicketOrderDetails";

export default {
  title: "Layouts/Protected/User/Tickets",
  component: TicketOrderDetails,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Details = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <TicketOrderDetails
          orderId={fakeTicketOrder.id}
          paymentMethod={fakeTicketOrder.payments[0].method}
        />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Details as "Ticket Order Details" };
