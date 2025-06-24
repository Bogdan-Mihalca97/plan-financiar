
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
}

interface BudgetOverviewProps {
  expensesByCategory: Record<string, number>;
}

const BudgetOverview = ({ expensesByCategory }: BudgetOverviewProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Eroare la încărcarea bugetelor",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Buget pe Categorii</CardTitle>
          <CardDescription>Se încarcă bugetele...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buget pe Categorii</CardTitle>
        <CardDescription>Progresul cheltuielilor față de bugetul alocat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const percentage = budget.limit_amount > 0 ? spent / budget.limit_amount * 100 : 0;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                    {spent.toFixed(2)} / {budget.limit_amount} Lei
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`} 
                />
                <div className="flex justify-between text-xs">
                  <span className={`${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                    {percentage.toFixed(1)}% folosit
                  </span>
                  <span className="text-gray-500">
                    {budget.period === 'monthly' ? 'Lunar' : 'Anual'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">Nu ai bugete configurate încă</p>
            <Button asChild size="sm">
              <Link to="/budgets">Creează primul buget</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
