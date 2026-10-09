import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { VoucherIncomeChart } from "./VoucherIncomeChart";

export default {
  title: "Layouts/Admin/Analytics Management/Charts",
  component: VoucherIncomeChart,
  parameters: {
    layout: "fullscreen",
  },
};

const VoucherChart = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <div className="flex bg-[#1A1A1A] p-4 min-h-screen">
          <VoucherIncomeChart />
        </div>
      </MobileProvider>
    </QueryProvider>
  );
};

export { VoucherChart as "Voucher Income Chart" };
