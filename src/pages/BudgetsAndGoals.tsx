
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, PiggyBank, Trophy, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import AddGoalForm from "@/components/goals/AddGoalForm";
import { useToast } from "@/hooks/use-toast";

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
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBudgets(), fetchGoals()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);
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

            {/* Budget Overview Cards */}
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
                  <CardTitle className="text-sm font-medium">Cheltuit Total</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 Lei</div>
                  <p className="text-xs text-muted-foreground">Nu ai cheltuieli înregistrate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rămas</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBudget.toFixed(2)} Lei</div>
                  <p className="text-xs text-muted-foreground">Din bugetele tale</p>
                </CardContent>
              </Card>
            </div>

            {/* Budgets List */}
            {budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                  <Card key={budget.id}>
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
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Limită:</span>
                          <span className="font-semibold">{budget.limit_amount.toFixed(2)} Lei</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cheltuit:</span>
                          <span className="font-semibold">0 Lei</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          0% din buget folosit
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

            {/* Goals Overview Cards */}
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

            {/* Goals List */}
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                  const isCompleted = goal.is_completed || progress >= 100;
                  
                  return (
                    <Card key={goal.id} className={isCompleted ? 'border-green-200 bg-green-50' : ''}>
                      {isCompleted && (
                        <div className="flex justify-end p-2">
                          <Trophy className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      
                      <CardHeader>
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

        {/* Add Budget Modal */}
        <AddBudgetForm 
          isOpen={showAddBudgetForm} 
          onClose={() => {
            setShowAddBudgetForm(false);
            handleBudgetAdded();
          }} 
        />

        {/* Add Goal Modal */}
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
