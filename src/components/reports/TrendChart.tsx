
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { month: "Ian", economii: 1500, cheltuieli: 3500 },
  { month: "Feb", economii: 1600, cheltuieli: 3200 },
  { month: "Mar", economii: 1400, cheltuieli: 3800 },
  { month: "Apr", economii: 1500, cheltuieli: 3600 },
  { month: "Mai", economii: 1900, cheltuieli: 3400 },
  { month: "Iun", economii: 1780, cheltuieli: 3420 },
];

const chartConfig = {
  economii: {
    label: "Economii",
    color: "hsl(142, 76%, 36%)",
  },
  cheltuieli: {
    label: "Cheltuieli",
    color: "hsl(0, 84%, 60%)",
  },
};

const TrendChart = () => {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line 
          type="monotone" 
          dataKey="economii" 
          stroke="var(--color-economii)" 
          strokeWidth={2}
          dot={{ fill: "var(--color-economii)" }}
        />
        <Line 
          type="monotone" 
          dataKey="cheltuieli" 
          stroke="var(--color-cheltuieli)" 
          strokeWidth={2}
          dot={{ fill: "var(--color-cheltuieli)" }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default TrendChart;
