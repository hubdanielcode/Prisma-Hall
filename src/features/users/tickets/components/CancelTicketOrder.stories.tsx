import { AuthenticationProvider } from "@/features/authentication";
import { CancelTicketOrder } from "./CancelTicketOrder";
import { fakeTicketOrder } from "../../../../../.storybook/mocks/hooks/users/useTicketOrder";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/User/Tickets",
  component: CancelTicketOrder,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Cancel = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CancelTicketOrder orderId={fakeTicketOrder.id} />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Cancel as "Cancel Ticket Order" };
