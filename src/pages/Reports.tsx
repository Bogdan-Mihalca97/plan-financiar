
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, PieChart, BarChart3, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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

        {/* Overview Cards - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venituri Luna</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0 Lei</div>
              <p className="text-xs text-muted-foreground">Nu ai venituri înregistrate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0 Lei</div>
              <p className="text-xs text-muted-foreground">Nu ai cheltuieli înregistrate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economii Luna</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">0 Lei</div>
              <p className="text-xs text-muted-foreground">0% din venituri</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata Economisire</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0%</div>
              <p className="text-xs text-muted-foreground">Obiectiv: 30%</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State for Reports */}
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
      </main>
    </div>
  );
};

export default Reports;
