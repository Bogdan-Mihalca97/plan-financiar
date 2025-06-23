
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, PieChart, BarChart3, Calendar, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import ExpenseChart from "@/components/reports/ExpenseChart";
import BudgetChart from "@/components/reports/BudgetChart";
import TrendChart from "@/components/reports/TrendChart";
import CategoryBreakdown from "@/components/reports/CategoryBreakdown";

const Reports = () => {
  const { user, logout } = useAuth();

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
            <h2 className="text-3xl font-bold text-gray-900">Rapoarte</h2>
            <p className="text-gray-600">Analizează-ți situația financiară cu grafice detaliate</p>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportă Raport
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venituri Luna</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">5.200 Lei</div>
              <p className="text-xs text-muted-foreground">+5.2% față de luna trecută</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3.420 Lei</div>
              <p className="text-xs text-muted-foreground">-1.2% față de luna trecută</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economii Luna</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1.780 Lei</div>
              <p className="text-xs text-muted-foreground">34.2% din venituri</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata Economisire</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">34.2%</div>
              <p className="text-xs text-muted-foreground">Obiectiv: 30%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Rezumat</TabsTrigger>
            <TabsTrigger value="expenses">Cheltuieli</TabsTrigger>
            <TabsTrigger value="budgets">Bugete</TabsTrigger>
            <TabsTrigger value="trends">Tendințe</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Breakdown Categorii
                  </CardTitle>
                  <CardDescription>Distribuția cheltuielilor pe categorii</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdown />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Venituri vs Cheltuieli
                  </CardTitle>
                  <CardDescription>Comparație lunară ultimele 6 luni</CardDescription>
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
                <CardDescription>Evoluția cheltuielilor pe categorii</CardDescription>
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
                <CardDescription>Progresul bugetelor față de țintele stabilite</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendințe Financiare</CardTitle>
                <CardDescription>Evoluția economiilor și cheltuielilor în timp</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
