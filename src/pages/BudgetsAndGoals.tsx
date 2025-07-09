
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, PiggyBank, Trophy, DollarSign, AlertTriangle } from "lucide-react";
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
              <Button onClick={() => setShowAddGoalForm(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900">
                <Plus className="h-4 w-4" />
                Adaugă Obiectiv
              </Button>
            </div>
          </div>

          <TabsContent value="budgets" className="space-y-6">
            {/* Summary Cards for Budgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Buget Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalBudget.toFixed(2)} Lei</div>
                  <p className="text-xs text-gray-500 mt-1">Limită stabilită</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Cheltuieli Actuale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalSpent.toFixed(2)} Lei</div>
                  <p className="text-xs text-gray-500 mt-1">Din bugetele active</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rămase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{(totalBudget - totalSpent).toFixed(2)} Lei</div>
                  <p className="text-xs text-gray-500 mt-1">Disponibil pentru cheltuieli</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Starea</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%</div>
                  <p className="text-xs text-gray-500 mt-1">Din buget utilizat</p>
                </CardContent>
              </Card>
            </div>

            {budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => {
                  const spent = monthlyExpensesByCategory[budget.category] || 0;
                  const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
                  const isOverBudget = percentage > 100;
                  const remaining = budget.limit_amount - spent;
                  
                  return (
                    <Card key={budget.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-900">{budget.category}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded-full ${budget.period === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {budget.period === 'monthly' ? 'Lunar' : 'Anual'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Limită</p>
                            <p className="font-semibold text-gray-900">{budget.limit_amount.toFixed(2)} Lei</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cheltuit</p>
                            <p className="font-semibold text-gray-900">{spent.toFixed(2)} Lei</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rămas</p>
                            <p className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {remaining.toFixed(2)} Lei
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Progres</p>
                            <p className={`font-semibold ${isOverBudget ? 'text-red-600' : percentage >= 75 ? 'text-orange-600' : 'text-green-600'}`}>
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget ? 'bg-red-500' : 
                                percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          {isOverBudget && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Buget depășit cu {(percentage - 100).toFixed(1)}%</span>
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

          <TabsContent value="goals" className="space-y-6">
            {/* Summary Cards for Goals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Obiective</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Obiective active</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Progres Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalTargetAmount > 0 ? ((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Din țintele stabilite</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Obiective Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{completedGoals}</div>
                  <p className="text-xs text-gray-500 mt-1">Din {goals.length} total</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Suma Economisită</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalCurrentAmount.toFixed(2)} Lei</div>
                  <p className="text-xs text-gray-500 mt-1">Progres către obiective</p>
                </CardContent>
              </Card>
            </div>

            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  const isCompleted = goal.is_completed || progress >= 100;
                  const deadlineDate = new Date(goal.deadline);
                  const today = new Date();
                  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <Card key={goal.id} className={`bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                      isCompleted ? 'border-l-green-500' : 
                      daysUntilDeadline < 30 ? 'border-l-red-500' : 
                      'border-l-blue-500'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</CardTitle>
                            {goal.description && (
                              <CardDescription className="text-sm text-gray-600">{goal.description}</CardDescription>
                            )}
                          </div>
                          {isCompleted && <Trophy className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Progres</p>
                            <p className="font-semibold text-gray-900">
                              {goal.current_amount.toFixed(0)} / {goal.target_amount.toFixed(0)} Lei
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Deadline</p>
                            <p className={`font-semibold ${
                              daysUntilDeadline < 0 ? 'text-red-600' : 
                              daysUntilDeadline < 30 ? 'text-orange-600' : 'text-gray-900'
                            }`}>
                              {deadlineDate.toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
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
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">{progress.toFixed(1)}%</span>
                            <span className={`${
                              daysUntilDeadline < 0 ? 'text-red-600' : 
                              daysUntilDeadline < 30 ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              {daysUntilDeadline < 0 ? 'Expirat' : 
                               daysUntilDeadline === 0 ? 'Astăzi' : 
                               `${daysUntilDeadline} zile`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {goal.category && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {goal.category}
                            </span>
                          )}
                          {goal.priority && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Prioritate {goal.priority === 'high' ? 'Mare' : goal.priority === 'medium' ? 'Medie' : 'Mică'}
                            </span>
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
