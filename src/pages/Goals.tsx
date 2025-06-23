
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Target, Trophy, DollarSign, Sparkles, TrendingUp } from "lucide-react";
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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (progress >= 75) return 'bg-gradient-to-r from-blue-400 to-indigo-500';
    if (progress >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-gray-300 to-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Se încarcă obiectivele magice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -left-8 w-24 h-24 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="relative">
                  <PiggyBank className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BugetControl
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hover:scale-105 transform">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hover:scale-105 transform">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hover:scale-105 transform">
                  Bugete
                </Link>
                <Link to="/goals" className="relative text-indigo-600 font-medium">
                  <span className="relative z-10">Obiective</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg -z-0 scale-110 opacity-50"></div>
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors hover:scale-105 transform">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-700 bg-white/50 px-3 py-1 rounded-full backdrop-blur">
                <span className="text-sm">✨ Bună, </span>
                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {userProfile?.first_name || 'Utilizator'}!
                </span>
              </div>
              <Button variant="outline" onClick={logout} className="hover:scale-105 transition-transform">
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Obiective Financiare
            </h2>
            <p className="text-gray-600 text-lg">Urmărește-ți progresul către obiectivele tale financiare ✨</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <Sparkles className="h-4 w-4" />
            Adaugă Obiectiv
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Total Obiective</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700">{goals.length}</div>
              <p className="text-xs text-blue-600/70 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Obiective active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Progres Total</CardTitle>
              <Trophy className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-700">{totalProgress.toFixed(1)}%</div>
              <p className="text-xs text-purple-600/70">Din obiectivele tale</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Obiective Complete</CardTitle>
              <PiggyBank className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-700">{completedGoals}</div>
              <p className="text-xs text-green-600/70">Din {goals.length} total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Suma Economisită</CardTitle>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-orange-700">{totalCurrentAmount.toFixed(2)} Lei</div>
              <p className="text-xs text-orange-600/70">Către obiective</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List or Empty State */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isCompleted = goal.is_completed || progress >= 100;
              
              return (
                <Card 
                  key={goal.id} 
                  className={`${isCompleted ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-white/80 backdrop-blur'} 
                  border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fade-in 0.6s ease-out forwards'
                  }}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <div className="relative">
                        <Trophy className="h-6 w-6 text-green-600" />
                        <div className="absolute inset-0 animate-ping">
                          <Trophy className="h-6 w-6 text-green-400 opacity-75" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold">
                        {goal.title}
                      </span>
                    </CardTitle>
                    {goal.description && (
                      <CardDescription className="text-sm text-gray-600">{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Progres:</span>
                        <span className="font-bold text-gray-800">
                          {goal.current_amount.toFixed(2)} / {goal.target_amount.toFixed(2)} Lei
                        </span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(progress)} relative overflow-hidden`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Deadline: {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                      
                      {goal.category && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {goal.category}
                          </span>
                          {goal.priority && (
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              goal.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800' :
                              goal.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                              'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                            }`}>
                              {goal.priority === 'high' ? '🔥 Prioritate Mare' :
                               goal.priority === 'medium' ? '⚡ Prioritate Medie' : '🌱 Prioritate Mică'}
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
          <Card className="bg-white/80 backdrop-blur border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"></div>
            <CardContent className="text-center py-16 relative z-10">
              <div className="mb-6 relative">
                <Target className="mx-auto h-20 w-20 text-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Nu ai încă obiective
              </h3>
              <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                Începe prin a-ți seta primul obiectiv financiar pentru a-ți urmări progresul și a-ți atinge visurile! ✨
              </p>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg px-8 py-3"
              >
                <Sparkles className="mr-2 h-5 w-5" />
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
