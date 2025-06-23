
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { category: "Alimentare", buget: 1000, cheltuit: 650 },
  { category: "Transport", buget: 400, cheltuit: 320 },
  { category: "Divertisment", buget: 300, cheltuit: 380 },
  { category: "Utilități", buget: 500, cheltuit: 450 },
  { category: "Sănătate", buget: 200, cheltuit: 150 },
];

const chartConfig = {
  buget: {
    label: "Buget",
    color: "hsl(221, 83%, 53%)",
  },
  cheltuit: {
    label: "Cheltuit",
    color: "hsl(0, 84%, 60%)",
  },
};

const BudgetChart = () => {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="buget" fill="var(--color-buget)" />
        <Bar dataKey="cheltuit" fill="var(--color-cheltuit)" />
      </BarChart>
    </ChartContainer>
  );
};

export default BudgetChart;
