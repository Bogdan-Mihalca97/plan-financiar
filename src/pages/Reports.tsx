
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, PieChart, BarChart3, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Link } from "react-router-dom";
import BudgetChart from "@/components/reports/BudgetChart";
import ExpenseChart from "@/components/reports/ExpenseChart";
import TrendChart from "@/components/reports/TrendChart";
import CategoryBreakdown from "@/components/reports/CategoryBreakdown";

const Reports = () => {
  const { user, logout } = useAuth();
  const { transactions, getTotalIncome, getTotalExpenses, getBalance, getTransactionsByCategory } = useTransactions();

  // Calculează statisticile reale
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  // Verifică dacă are date pentru a afișa rapoarte
  const hasData = transactions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Bugete
                </Link>
                <Link to="/goals" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/reports" className="text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-700 text-sm sm:text-base hidden sm:inline">
                Bună, {user?.firstName}!
              </span>
              <Button variant="outline" size="sm" onClick={logout} className="text-xs sm:text-sm">
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Rapoarte</h2>
            <p className="text-gray-600 text-sm sm:text-base">Analizează-ți situația financiară cu grafice detaliate</p>
          </div>
          {hasData && (
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportă Raport</span>
              <span className="sm:hidden">Exportă</span>
            </Button>
          )}
        </div>

        {hasData ? (
          <>
            {/* Overview Cards cu date reale */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <TrendingUp className="h-4 w-4 text-red-500" />
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
                  <CardTitle className="text-sm font-medium">Economii Luna</CardTitle>
                  <PiggyBank className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {balance.toLocaleString('ro-RO')} Lei
                  </div>
                  <p className="text-xs text-muted-foreground">{savingsRate.toFixed(1)}% din venituri</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata Economisire</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Obiectiv: 30%</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Privire Generală</TabsTrigger>
                <TabsTrigger value="expenses">Cheltuieli</TabsTrigger>
                <TabsTrigger value="budgets">Bugete</TabsTrigger>
                <TabsTrigger value="trends">Tendințe</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuția Cheltuielilor</CardTitle>
                      <CardDescription>Repartizarea cheltuielilor pe categorii</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CategoryBreakdown />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Comparație Venituri vs Cheltuieli</CardTitle>
                      <CardDescription>Evoluția în ultimele 6 luni</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExpenseChart />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analiza Cheltuielilor</CardTitle>
                    <CardDescription>Detalii despre cheltuielile tale lunare</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpenseChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budgets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performanța Bugetelor</CardTitle>
                    <CardDescription>Comparația între bugetele planificate și cheltuielile reale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BudgetChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendințele Economiilor</CardTitle>
                    <CardDescription>Evoluția economiilor în timpul</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TrendChart />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Empty State pentru rapoarte */
          <Card>
            <CardContent className="text-center py-12">
              <div className="mb-4">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nu ai date pentru rapoarte</h3>
              <p className="text-gray-500 mb-6">
                Pentru a vedea rapoarte și grafice, mai întâi adaugă tranzacții, bugete și obiective.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/transactions">Adaugă Tranzacții</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/budgets">Creează Bugete</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Reports;
