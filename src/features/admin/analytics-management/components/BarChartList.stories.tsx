import { BarChartList } from "./BarChartList";
import { formatCurrency } from "@/shared/utils/functions/formatters";

export default {
  title: "Layouts/Admin/Analytics Management/Charts",
  component: BarChartList,
  parameters: {
    layout: "fullscreen",
  },
};

const BarChart = () => {
  return (
    <div className="bg-black p-4">
      <BarChartList
        items={[
          { id: "funk", title: "Funk", value: 1800 },
          { id: "rock", title: "Rock", value: 1200 },
          { id: "pop", title: "Pop", value: 650 },
        ]}
        isLoading={false}
        formatValue={formatCurrency}
        emptyMessage="Nenhum dado neste período."
      />
    </div>
  );
};

export { BarChart as "Bar Chart" };
