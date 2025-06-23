
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { month: "Ian", venituri: 5000, cheltuieli: 3500 },
  { month: "Feb", venituri: 4800, cheltuieli: 3200 },
  { month: "Mar", venituri: 5200, cheltuieli: 3800 },
  { month: "Apr", venituri: 5100, cheltuieli: 3600 },
  { month: "Mai", venituri: 5300, cheltuieli: 3400 },
  { month: "Iun", venituri: 5200, cheltuieli: 3420 },
];

const chartConfig = {
  venituri: {
    label: "Venituri",
    color: "hsl(142, 76%, 36%)",
  },
  cheltuieli: {
    label: "Cheltuieli", 
    color: "hsl(0, 84%, 60%)",
  },
};

const ExpenseChart = () => {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="venituri" fill="var(--color-venituri)" />
        <Bar dataKey="cheltuieli" fill="var(--color-cheltuieli)" />
      </BarChart>
    </ChartContainer>
  );
};

export default ExpenseChart;
