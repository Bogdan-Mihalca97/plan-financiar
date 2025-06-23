
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";

const Budgets = () => {
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Start with empty budgets for new users
  const mockBudgets: any[] = [];

  const totalBudget = 0;
  const totalSpent = 0;

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
            <h2 className="text-3xl font-bold text-gray-900">Bugete</h2>
            <p className="text-gray-600">Gestionează-ți bugetele pe categorii</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adaugă Buget
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buget Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Lei</div>
              <p className="text-xs text-muted-foreground">Nu ai bugete încă</p>
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
              <div className="text-2xl font-bold">0 Lei</div>
              <p className="text-xs text-muted-foreground">Creează primul buget</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Target className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nu ai încă bugete</h3>
            <p className="text-gray-500 mb-6">
              Începe prin a crea primul tău buget pentru a-ți gestiona cheltuielile pe categorii.
            </p>
            <Button onClick={() => setShowAddForm(true)} className="mx-auto">
              Creează Primul Buget
            </Button>
          </CardContent>
        </Card>

        {/* Add Budget Modal */}
        <AddBudgetForm 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)} 
        />
      </main>
    </div>
  );
};

export default Budgets;
