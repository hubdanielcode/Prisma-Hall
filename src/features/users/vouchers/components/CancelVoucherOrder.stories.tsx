import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CancelVoucherOrder } from "./CancelVoucherOrder";
import { fakeVoucherOrder } from "../../../../../.storybook/mocks/hooks/users/useVoucherOrder";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/User/Vouchers",
  component: CancelVoucherOrder,
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
        <CancelVoucherOrder orderId={fakeVoucherOrder.id} />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Cancel as "Cancel Voucher Order" };
