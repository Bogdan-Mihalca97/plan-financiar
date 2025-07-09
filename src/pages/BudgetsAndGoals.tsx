
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, PiggyBank, Trophy, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import AddGoalForm from "@/components/goals/AddGoalForm";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
  created_at: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string | null;
  priority: string | null;
  is_completed: boolean;
  created_at: string;
}

const BudgetsAndGoals = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { getTransactionsByCategory } = useTransactions();
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const monthlyExpensesByCategory = getTransactionsByCategory();

  const fetchData = async () => {
    try {
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      setBudgets(budgetsData || []);
      setGoals(goalsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Eroare la încărcarea datelor",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Budget calculations
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = monthlyExpensesByCategory[budget.category] || 0;
    return sum + spent;
  }, 0);

  // Goals calculations
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const completedGoals = goals.filter(goal => goal.is_completed).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bugete și Obiective</h2>
            <p className="text-gray-600">Gestionează-ți bugetele și urmărește-ți obiectivele financiare</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buget Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBudget.toFixed(2)} Lei</div>
              <p className="text-xs text-muted-foreground">
                Cheltuit: {totalSpent.toFixed(2)} Lei
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obiective</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">
                Complete: {completedGoals}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progres Economii</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCurrentAmount.toFixed(2)} Lei</div>
              <p className="text-xs text-muted-foreground">
                Țintă: {totalTargetAmount.toFixed(2)} Lei
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="budgets" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="budgets">Bugete</TabsTrigger>
              <TabsTrigger value="goals">Obiective</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddBudgetForm(true)} variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Buget
              </Button>
              <Button onClick={() => setShowAddGoalForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Obiectiv
              </Button>
            </div>
          </div>

          <TabsContent value="budgets" className="space-y-4">
            {budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => {
                  const spent = monthlyExpensesByCategory[budget.category] || 0;
                  const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
                  const isOverBudget = percentage > 100;
                  const remaining = budget.limit_amount - spent;
                  
                  return (
                    <Card key={budget.id} className={isOverBudget ? 'border-red-200 bg-red-50' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{budget.category}</span>
                          <span className="text-sm font-normal text-gray-500">
                            {budget.period === 'monthly' ? 'Lunar' : 'Anual'}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Limită: {budget.limit_amount.toFixed(2)} Lei</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cheltuit: {spent.toFixed(2)} Lei</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                              Rămas: {remaining.toFixed(2)} Lei
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget ? 'bg-red-500' : 
                                percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <p className={`text-xs text-center ${isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            {percentage.toFixed(1)}% utilizat
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu ai încă bugete</h3>
                  <p className="text-gray-500 mb-6">
                    Începe prin a crea primul tău buget pentru a-ți gestiona cheltuielile.
                  </p>
                  <Button onClick={() => setShowAddBudgetForm(true)}>
                    Creează Primul Buget
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  const isCompleted = goal.is_completed || progress >= 100;
                  
                  return (
                    <Card key={goal.id} className={isCompleted ? 'border-green-200 bg-green-50' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="truncate">{goal.title}</span>
                          {isCompleted && <Trophy className="h-5 w-5 text-green-600" />}
                        </CardTitle>
                        {goal.description && (
                          <CardDescription>{goal.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progres:</span>
                            <span className="font-semibold">
                              {goal.current_amount.toFixed(2)} / {goal.target_amount.toFixed(2)} Lei
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                progress >= 100 ? 'bg-green-600' : 
                                progress >= 75 ? 'bg-blue-600' : 
                                progress >= 50 ? 'bg-yellow-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              {progress.toFixed(1)}%
                            </span>
                            <span className="text-gray-500">
                              {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                          
                          {goal.category && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {goal.category}
                              </span>
                              {goal.priority && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {goal.priority === 'high' ? 'Mare' : goal.priority === 'medium' ? 'Medie' : 'Mică'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu ai încă obiective</h3>
                  <p className="text-gray-500 mb-6">
                    Începe prin a-ți seta primul obiectiv financiar.
                  </p>
                  <Button onClick={() => setShowAddGoalForm(true)}>
                    Setează Primul Obiectiv
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <AddBudgetForm 
          isOpen={showAddBudgetForm} 
          onClose={() => {
            setShowAddBudgetForm(false);
            fetchData();
          }} 
        />

        <AddGoalForm 
          isOpen={showAddGoalForm} 
          onClose={() => {
            setShowAddGoalForm(false);
            fetchData();
          }} 
        />
      </main>
    </div>
  );
};

export default BudgetsAndGoals;
