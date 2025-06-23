
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Plus, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "yearly";
}

const Budgets = () => {
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data pentru bugete
  const mockBudgets: Budget[] = [
    {
      id: "1",
      category: "Alimentare",
      limit: 1000,
      spent: 650,
      period: "monthly"
    },
    {
      id: "2", 
      category: "Transport",
      limit: 400,
      spent: 320,
      period: "monthly"
    },
    {
      id: "3",
      category: "Divertisment",
      limit: 300,
      spent: 380,
      period: "monthly"
    },
    {
      id: "4",
      category: "Utilități",
      limit: 500,
      spent: 450,
      period: "monthly"
    }
  ];

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <Target className="h-4 w-4 text-green-500" />;
  };

  const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = mockBudgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <PiggyBank className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bună, {user?.firstName}!</span>
              <Button variant="outline" onClick={logout}>
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bugete</h2>
            <p className="text-gray-600">Gestionează-ți bugetele pe categorii</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adaugă Buget
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buget Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBudget.toLocaleString()} Lei</div>
              <p className="text-xs text-muted-foreground">Pentru luna aceasta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheltuit Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpent.toLocaleString()} Lei</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% din buget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rămas</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalBudget - totalSpent).toLocaleString()} Lei</div>
              <p className="text-xs text-muted-foreground">Disponibil în acest buget</p>
            </CardContent>
          </Card>
        </div>

        {/* Budgets List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockBudgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <CardDescription>
                        Buget {budget.period === "monthly" ? "lunar" : "anual"}
                      </CardDescription>
                    </div>
                    {getStatusIcon(budget.spent, budget.limit)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progres</span>
                      <span>{budget.spent} / {budget.limit} Lei</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% utilizat</span>
                      <span>
                        {budget.spent > budget.limit 
                          ? `Depășit cu ${budget.spent - budget.limit} Lei`
                          : `Rămas ${budget.limit - budget.spent} Lei`
                        }
                      </span>
                    </div>
                  </div>
                  
                  {budget.spent > budget.limit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Buget depășit!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Budget Modal */}
        <AddBudgetForm 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)} 
        />
      </main>
    </div>
  );
};

export default Budgets;
