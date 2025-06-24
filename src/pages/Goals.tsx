import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Target, Trophy, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AddGoalForm from "@/components/goals/AddGoalForm";
import { useToast } from "@/hooks/use-toast";

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

const Goals = () => {
  const { userProfile, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const totalProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const handleGoalAdded = () => {
    fetchGoals();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Se încarcă obiectivele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <PiggyBank className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
              </Link>
              <nav className="hidden lg:flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Buget
                </Link>
                <Link to="/goals" className="text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-700">
                Bună, <span className="font-semibold">{userProfile?.first_name || 'Utilizator'}!</span>
              </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Obiective Financiare</h2>
            <p className="text-gray-600">Urmărește-ți progresul către obiectivele tale financiare</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adaugă Obiectiv
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Goals List or Empty State */}
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
              <Button onClick={() => setShowAddForm(true)}>
                Setează Primul Obiectiv
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Goal Modal */}
        <AddGoalForm 
          isOpen={showAddForm} 
          onClose={() => {
            setShowAddForm(false);
            handleGoalAdded();
          }} 
        />
      </main>
    </div>
  );
};

export default Goals;
