import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, TrendingUp, TrendingDown, Target, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Link, Navigate } from "react-router-dom";

const Dashboard = () => {
  const {
    userProfile,
    logout,
    isAuthenticated,
    loading,
    user
  } = useAuth();
  
  const {
    transactions,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getTransactionsByCategory
  } = useTransactions();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Calculează statisticile reale
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const expensesByCategory = getTransactionsByCategory();

  // Calculează rata de economisire
  const savingsRate = totalIncome > 0 ? balance / totalIncome * 100 : 0;

  // Categoriile pentru bugete (cu valori mock pentru buget, dar cheltuieli reale)
  const budgetCategories = [{
    name: "Alimentare",
    budget: 1000,
    spent: expensesByCategory["Alimentare"] || 0
  }, {
    name: "Transport",
    budget: 400,
    spent: expensesByCategory["Transport"] || 0
  }, {
    name: "Divertisment",
    budget: 300,
    spent: expensesByCategory["Divertisment"] || 0
  }, {
    name: "Utilități",
    budget: 500,
    spent: expensesByCategory["Utilități"] || 0
  }];

  // Tranzacții recente (ultimele 5)
  const recentTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };
  const formatAmount = (amount: number, type: "income" | "expense") => {
    const sign = type === "income" ? "+" : "-";
    const color = type === "income" ? "text-green-600" : "text-red-600";
    return <span className={`font-medium ${color}`}>
        {sign}{amount} Lei
      </span>;
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
                <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">BugetControl</h1>
              </Link>
              <nav className="hidden lg:flex space-x-6">
                <Link to="/dashboard" className="text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Buget
                </Link>
                <Link to="/goals" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/family" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Familie
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-700">
                  Bună, {userProfile?.first_name || 'Utilizator'}!
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 mr-1" />
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Bună, {userProfile?.first_name || 'Utilizator'}!</h2>
          <p className="text-gray-600 text-sm sm:text-base">Iată o privire de ansamblu asupra situației tale financiare</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Total</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance.toLocaleString('ro-RO')} Lei
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? 'Situație pozitivă' : 'Atenție la cheltuieli'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venituri Luna</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('ro-RO')} Lei
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === 'income').length} tranzacții
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('ro-RO')} Lei
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.type === 'expense').length} tranzacții
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata Economisire</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {savingsRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Obiectiv: 30%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bugete Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Buget pe Categorii</CardTitle>
              <CardDescription>Progresul cheltuielilor față de bugetul alocat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetCategories.length > 0 ? budgetCategories.map(category => {
              const percentage = category.budget > 0 ? category.spent / category.budget * 100 : 0;
              const isOverBudget = percentage > 100;
              return <div key={category.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                          {category.spent} / {category.budget} Lei
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`} />
                      <div className="text-xs text-right text-gray-500">
                        {percentage.toFixed(1)}% folosit
                      </div>
                    </div>;
            }) : <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">Nu ai bugete configurate încă</p>
                  <Button asChild size="sm">
                    <Link to="/budgets">Creează primul buget</Link>
                  </Button>
                </div>}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Tranzacții Recente</CardTitle>
              <CardDescription>Ultimele 5 tranzacții adăugate</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? <div className="space-y-3">
                  {recentTransactions.map(transaction => <div key={transaction.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)} • {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        {formatAmount(transaction.amount, transaction.type)}
                      </div>
                    </div>)}
                  <div className="pt-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/transactions">Vezi toate tranzacțiile</Link>
                    </Button>
                  </div>
                </div> : <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nu ai tranzacții încă</p>
                  <Button asChild>
                    <Link to="/transactions">
                      <Plus className="mr-2 h-4 w-4" />
                      Adaugă prima tranzacție
                    </Link>
                  </Button>
                </div>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};

export default Dashboard;
