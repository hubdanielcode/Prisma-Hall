import { AnalyticsChartFilter } from "./AnalyticsChartFilter";
import { MobileProvider } from "@/shared/context/MobileContext";

export default {
  title: "Layouts/Admin/Analytics Management",
  component: AnalyticsChartFilter,
  parameters: {
    layout: "fullscreen",
  },
};

const ChartFilter = () => {
  return (
    <MobileProvider>
      <div className="bg-black p-4">
        <AnalyticsChartFilter
          selectedPeriod="this month"
          onPeriodChange={() => {}}
          categoryOptions={[
            { id: "all_tags", title: "Todos os Gêneros" },
            { id: "funk", title: "Funk" },
            { id: "rock", title: "Rock" },
          ]}
          selectedCategory="all_tags"
          onCategoryChange={() => {}}
        />
      </div>
    </MobileProvider>
  );
};

export { ChartFilter as "Chart Filter" };
