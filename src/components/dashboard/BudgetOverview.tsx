
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
}

interface BudgetOverviewProps {
  expensesByCategory: Record<string, number>;
}

const BudgetOverview = ({ expensesByCategory }: BudgetOverviewProps) => {
  const budgetCategories: BudgetCategory[] = [
    {
      name: "Alimentare",
      budget: 1000,
      spent: expensesByCategory["Alimentare"] || 0
    },
    {
      name: "Transport",
      budget: 400,
      spent: expensesByCategory["Transport"] || 0
    },
    {
      name: "Divertisment",
      budget: 300,
      spent: expensesByCategory["Divertisment"] || 0
    },
    {
      name: "Utilități",
      budget: 500,
      spent: expensesByCategory["Utilități"] || 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buget pe Categorii</CardTitle>
        <CardDescription>Progresul cheltuielilor față de bugetul alocat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetCategories.length > 0 ? (
          budgetCategories.map(category => {
            const percentage = category.budget > 0 ? category.spent / category.budget * 100 : 0;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                    {category.spent} / {category.budget} Lei
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`} 
                />
                <div className="text-xs text-right text-gray-500">
                  {percentage.toFixed(1)}% folosit
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
