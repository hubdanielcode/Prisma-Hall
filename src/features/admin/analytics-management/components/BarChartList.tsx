"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BarChartItemProps } from "@/features/admin/analytics-management/types/barChartItem";

interface BarChartListProps {
  items: BarChartItemProps[];
  isLoading: boolean;
  formatValue: (value: number) => string;
  emptyMessage: string;
}

const BarChartList = ({ items, isLoading, formatValue, emptyMessage }: BarChartListProps) => {
  /* - Definições - */

  const highestValue = Math.max(...items.map((item) => item.value), 0);
  const hasData = highestValue > 0;
  const chartHeight = Math.max(items.length * 40, 160);

  if (isLoading) {
    return <span className="text-white/60 text-sm py-6 text-center">Carregando dados...</span>;
  }

  if (!hasData) {
    return <span className="text-white/60 text-sm py-6 text-center">{emptyMessage}</span>;
  }

  return (
    <div
      className="w-full"
      style={{ height: chartHeight }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="#B8860B"
            strokeOpacity={0.15}
            horizontal={false}
          />

          <XAxis
            type="number"
            hide
          />

          <YAxis
            type="category"
            dataKey="title"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}
          />

          <Tooltip
            cursor={{ fill: "rgba(184,134,11,0.12)" }}
            contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #B8860B", borderRadius: 8 }}
            labelStyle={{ color: "#FFFFFF", fontWeight: 600 }}
            itemStyle={{ color: "#B8860B", fontWeight: 600 }}
            formatter={(value) => [formatValue(Number(value)), ""]}
          />

          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            barSize={18}
            animationDuration={600}
          >
            {items.map((item) => (
              <Cell
                key={item.id}
                fill="#B8860B"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { BarChartList };
