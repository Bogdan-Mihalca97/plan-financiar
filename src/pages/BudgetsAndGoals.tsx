import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, PiggyBank, Trophy, DollarSign, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import AddGoalForm from "@/components/goals/AddGoalForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get monthly expense data from transactions
  const monthlyExpensesByCategory = getTransactionsByCategory();

  const fetchBudgets = async () => {
    try {
      setError(null);
      console.log('Attempting to fetch budgets...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setError('Utilizatorul nu este autentificat');
        return;
      }

      console.log('User authenticated, fetching budgets for user:', user.id);

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Budgets fetched successfully:', data);
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      const errorMessage = error?.message || 'Eroare necunoscută la încărcarea bugetelor';
      setError(errorMessage);
      toast({
        title: "Eroare la încărcarea bugetelor",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Eroare la încărcarea obiectivelor",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      toast({
        title: "Buget șters",
        description: "Bugetul a fost șters cu succes.",
      });
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Eroare la ștergerea bugetului",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Obiectiv șters",
        description: "Obiectivul a fost șters cu succes.",
      });
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Eroare la ștergerea obiectivului",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBudgets(), fetchGoals()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = monthlyExpensesByCategory[budget.category] || 0;
    return sum + spent;
  }, 0);
  const totalRemaining = totalBudget - totalSpent;

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const totalProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const handleBudgetAdded = () => {
    fetchBudgets();
  };

  const handleGoalAdded = () => {
    fetchGoals();
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Target className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Eroare la încărcarea datelor</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Încearcă din nou
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bugete și Obiective</h2>
            <p className="text-gray-600">Gestionează-ți bugetele și urmărește-ți obiectivele financiare</p>
          </div>
        </div>

        <Tabs defaultValue="budgets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budgets">Bugete</TabsTrigger>
            <TabsTrigger value="goals">Obiective</TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Bugetele Tale</h3>
              <Button onClick={() => setShowAddBudgetForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Buget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Buget Total</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBudget.toFixed(2)} Lei</div>
                  <p className="text-xs text-muted-foreground">
                    {budgets.length} {budgets.length === 1 ? 'buget activ' : 'bugete active'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cheltuit Luna Aceasta</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSpent.toFixed(2)} Lei</div>
                  <p className="text-xs text-muted-foreground">
                    {totalSpent > 0 ? 'Din bugetele tale' : 'Nu ai cheltuieli înregistrate'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rămas</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : ''}`}>
                    {totalRemaining.toFixed(2)} Lei
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalRemaining < 0 ? 'Buget depășit!' : 'Din bugetele tale'}
                  </p>
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
                    <Card key={budget.id} className={isOverBudget ? 'border-red-200 bg-red-50' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{budget.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-normal text-gray-500">
                              {budget.period === 'monthly' ? 'Lunar' : 'Anual'}
                            </span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Șterge Bugetul</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Ești sigur că vrei să ștergi bugetul pentru categoria "{budget.category}"? 
                                    Această acțiune nu poate fi anulată.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBudget(budget.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Șterge
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Limită:</span>
                            <span className="font-semibold">{budget.limit_amount.toFixed(2)} Lei</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cheltuit:</span>
                            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : ''}`}>
                              {spent.toFixed(2)} Lei
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rămas:</span>
                            <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {remaining.toFixed(2)} Lei
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
                          {isOverBudget && (
                            <div className="bg-red-100 border border-red-200 rounded p-1">
                              <div className="h-1 bg-red-500 rounded-full" style={{ width: `${Math.min(percentage - 100, 100)}%` }} />
                            </div>
                          )}
                          <p className={`text-xs text-center ${isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            {percentage.toFixed(1)}% din buget folosit
                            {isOverBudget && ' (Depășit!)'}
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
                  <div className="mb-4">
                    <Target className="mx-auto h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nu ai încă bugete</h3>
                  <p className="text-gray-500 mb-6">
                    Începe prin a crea primul tău buget pentru a-ți gestiona cheltuielile pe categorii.
                  </p>
                  <Button onClick={() => setShowAddBudgetForm(true)} className="mx-auto">
                    Creează Primul Buget
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Obiectivele Tale</h3>
              <Button onClick={() => setShowAddGoalForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adaugă Obiectiv
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Obiective</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{goals.length}</div>
                  <p className="text-xs text-muted-foreground">Obiective active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progres Total</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProgress.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Din obiectivele tale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Obiective Complete</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedGoals}</div>
                  <p className="text-xs text-muted-foreground">Din {goals.length} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suma Economisită</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCurrentAmount.toFixed(2)} Lei</div>
                  <p className="text-xs text-muted-foreground">Către obiective</p>
                </CardContent>
              </Card>
            </div>

            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  const isCompleted = goal.is_completed || progress >= 100;
                  
                  return (
                    <Card key={goal.id} className={isCompleted ? 'border-green-200 bg-green-50' : ''}>
                      <div className="flex justify-between items-start p-2">
                        {isCompleted && <Trophy className="h-5 w-5 text-green-600" />}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Șterge Obiectivul</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ești sigur că vrei să ștergi obiectivul "{goal.title}"? 
                                Această acțiune nu poate fi anulată.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteGoal(goal.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Șterge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <CardHeader className="pt-0">
                        <CardTitle className="flex items-center justify-between">
                          <span className="truncate">{goal.title}</span>
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
                              Deadline: {new Date(goal.deadline).toLocaleDateString('ro-RO')}
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
                                  Prioritate {goal.priority === 'high' ? 'Mare' : goal.priority === 'medium' ? 'Medie' : 'Mică'}
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
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu ai încă obiective</h3>
                  <p className="text-gray-500 mb-6">
                    Începe prin a-ți seta primul obiectiv financiar pentru a-ți urmări progresul.
                  </p>
                  <Button onClick={() => setShowAddGoalForm(true)}>
                    Setează Primul Obiectiv
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AddBudgetForm 
          isOpen={showAddBudgetForm} 
          onClose={() => {
            setShowAddBudgetForm(false);
            handleBudgetAdded();
          }} 
        />

        <AddGoalForm 
          isOpen={showAddGoalForm} 
          onClose={() => {
            setShowAddGoalForm(false);
            handleGoalAdded();
          }} 
        />
      </main>
    </div>
  );
};

export default BudgetsAndGoals;
