import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { fakeVoucherOrder } from "../../../../../.storybook/mocks/hooks/users/useVoucherOrder";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { VoucherOrderDetails } from "./VoucherOrderDetails";

export default {
  title: "Layouts/Protected/User/Vouchers",
  component: VoucherOrderDetails,
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
        <VoucherOrderDetails orderId={fakeVoucherOrder.id} />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Details as "Voucher Order Details" };
