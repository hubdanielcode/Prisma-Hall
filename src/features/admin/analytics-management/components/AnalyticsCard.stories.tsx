import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AnalyticsCard } from "./AnalyticsCard";

export default {
  title: "Layouts/Admin/Analytics Management",
  component: AnalyticsCard,
  parameters: {
    layout: "fullscreen",
  },
};

const AnalyticsCards = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <div className="bg-[#1A1A1A] p-4">
          <AnalyticsCard
            selectedPeriod="this month"
            selectedTag="all_tags"
          />
        </div>
      </MobileProvider>
    </QueryProvider>
  );
};

export { AnalyticsCards as "Analytics Cards" };
