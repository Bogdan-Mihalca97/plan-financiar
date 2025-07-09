
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { name: "Cumpărături", value: 650, color: "#ef4444" },
  { name: "Transport", value: 320, color: "#f97316" },
  { name: "Divertisment", value: 380, color: "#eab308" },
  { name: "Utilități", value: 450, color: "#22c55e" },
  { name: "Sănătate", value: 150, color: "#3b82f6" },
  { name: "Altele", value: 200, color: "#8b5cf6" },
];

const chartConfig = {
  value: {
    label: "Suma",
  },
};

const CategoryBreakdown = () => {
  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[250px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
      
      <div className="grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-sm font-medium">{item.value} Lei</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
