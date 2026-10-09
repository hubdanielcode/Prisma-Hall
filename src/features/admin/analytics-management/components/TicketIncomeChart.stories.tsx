import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { TicketIncomeChart } from "./TicketIncomeChart";

export default {
  title: "Layouts/Admin/Analytics Management/Charts",
  component: TicketIncomeChart,
  parameters: {
    layout: "fullscreen",
  },
};

const TicketChart = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <div className="flex bg-[#1A1A1A] p-4 min-h-screen">
          <TicketIncomeChart />
        </div>
      </MobileProvider>
    </QueryProvider>
  );
};

export { TicketChart as "Ticket Income Chart" };
