
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Plus, Target, Trophy, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import AddGoalForm from "@/components/goals/AddGoalForm";

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "savings" | "debt" | "investment" | "purchase";
  priority: "low" | "medium" | "high";
}

const Goals = () => {
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data pentru obiective
  const mockGoals: Goal[] = [
    {
      id: "1",
      title: "Fond de urgență",
      description: "6 luni de cheltuieli pentru situații de urgență",
      targetAmount: 20000,
      currentAmount: 12500,
      deadline: "2024-12-31",
      category: "savings",
      priority: "high"
    },
    {
      id: "2",
      title: "Concediu în Grecia",
      description: "Vacanță de vară pentru familia întreagă",
      targetAmount: 5000,
      currentAmount: 2800,
      deadline: "2024-07-15",
      category: "purchase",
      priority: "medium"
    },
    {
      id: "3",
      title: "Mașină nouă",
      description: "Avans pentru mașina nouă",
      targetAmount: 15000,
      currentAmount: 8200,
      deadline: "2025-03-01",
      category: "purchase",
      priority: "medium"
    },
    {
      id: "4",
      title: "Investiții ETF",
      description: "Portofoliu diversificat de investiții",
      targetAmount: 30000,
      currentAmount: 4500,
      deadline: "2025-12-31",
      category: "investment",
      priority: "low"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "savings": return <PiggyBank className="h-4 w-4" />;
      case "investment": return <Trophy className="h-4 w-4" />;
      case "purchase": return <DollarSign className="h-4 w-4" />;
      case "debt": return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "savings": return "Economii";
      case "investment": return "Investiții";
      case "purchase": return "Cumpărături";
      case "debt": return "Datorii";
      default: return "Altele";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Prioritate Mare";
      case "medium": return "Prioritate Medie";
      case "low": return "Prioritate Mică";
      default: return "Normală";
    }
  };

  const totalTargetAmount = mockGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = mockGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = mockGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

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
            <h2 className="text-3xl font-bold text-gray-900">Obiective Financiare</h2>
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
              <div className="text-2xl font-bold">{mockGoals.length}</div>
              <p className="text-xs text-muted-foreground">Obiective active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progres Total</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCurrentAmount.toLocaleString()} / {totalTargetAmount.toLocaleString()} Lei
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obiective Complete</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals}</div>
              <p className="text-xs text-muted-foreground">Din {mockGoals.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suma Economisită</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCurrentAmount.toLocaleString()} Lei</div>
              <p className="text-xs text-muted-foreground">Către obiective</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockGoals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remainingAmount = goal.targetAmount - goal.currentAmount;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={goal.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(goal.category)}
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <CardDescription className="mb-2">{goal.description}</CardDescription>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs border ${getPriorityColor(goal.priority)}`}>
                          {getPriorityLabel(goal.priority)}
                        </span>
                        <span className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-600 border border-blue-200">
                          {getCategoryLabel(goal.category)}
                        </span>
                      </div>
                    </div>
                    {isCompleted && <Trophy className="h-5 w-5 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progres</span>
                      <span>{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} Lei</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% realizat</span>
                      <span>
                        {isCompleted 
                          ? "🎉 Obiectiv atins!"
                          : `Rămas ${remainingAmount.toLocaleString()} Lei`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Deadline: {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                      {!isCompleted && (
                        <span className={`ml-2 ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                          ({daysRemaining > 0 ? `${daysRemaining} zile rămase` : 'Expirat'})
                        </span>
                      )}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="bg-green-100 border border-green-200 rounded-md p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-medium">Felicitări! Ai atins acest obiectiv!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Goal Modal */}
        <AddGoalForm 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)} 
        />
      </main>
    </div>
  );
};

export default Goals;
