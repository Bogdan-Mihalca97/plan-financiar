
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
}

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
  const { getTransactionsByCategory } = useTransactions();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const expensesByCategory = getTransactionsByCategory();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBudgets(data || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    fetchBudgets();
  }, []);

  const chartData = budgets.map(budget => ({
    category: budget.category,
    buget: budget.limit_amount,
    cheltuit: expensesByCategory[budget.category] || 0
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="buget" fill="var(--color-buget)" />
          <Bar dataKey="cheltuit" fill="var(--color-cheltuit)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default BudgetChart;
