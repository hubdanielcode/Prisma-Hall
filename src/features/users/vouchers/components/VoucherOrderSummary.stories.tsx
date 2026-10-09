import { fakeVoucherOrders } from "../../../../../.storybook/mocks/hooks/users/useVoucherOrder";
import { VoucherOrderSummary } from "./VoucherOrderSummary";

export default {
  title: "Layouts/Protected/User/Vouchers",
  component: VoucherOrderSummary,
  parameters: {
    layout: "fullscreen",
  },
};

const Summary = () => {
  return (
    <div className="flex justify-center min-h-screen w-full p-10 bg-[#1A1A1A]">
      <div className="w-full max-w-3xl">
        <VoucherOrderSummary order={fakeVoucherOrders[0]} />
      </div>
    </div>
  );
};

const CancelledSummary = () => {
  return (
    <div className="flex justify-center min-h-screen w-full p-10 bg-[#1A1A1A]">
      <div className="w-full max-w-3xl">
        <VoucherOrderSummary order={fakeVoucherOrders[1]} />
      </div>
    </div>
  );
};

export { Summary as "Voucher Order Summary", CancelledSummary as "Cancelled Voucher Order Summary" };
