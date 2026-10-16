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
          { id: "beers", title: "Cervejas", value: 1800 },
          { id: "cocktails", title: "Coquetéis", value: 1200 },
          { id: "drinks", title: "Drinks", value: 650 },
          { id: "no_alcohol", title: "Sem Álcool", value: 300 },
        ]}
        isLoading={false}
        formatValue={formatCurrency}
        emptyMessage="Nenhum dado neste período."
      />
    </div>
  );
};

export { BarChart as "Bar Chart" };
