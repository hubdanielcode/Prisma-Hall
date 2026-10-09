import { MobileProvider } from "@/shared/context/MobileContext";
import { NewBuyersChart } from "./NewBuyersChart";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Admin/Analytics Management/Charts",
  component: NewBuyersChart,
  parameters: {
    layout: "fullscreen",
  },
};

const BuyersChart = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <div className="flex flex-col bg-[#1A1A1A] p-4 min-h-screen">
          <NewBuyersChart />
        </div>
      </MobileProvider>
    </QueryProvider>
  );
};

export { BuyersChart as "New Buyers Chart" };
