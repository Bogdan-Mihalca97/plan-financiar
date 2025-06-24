
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
  created_at: string;
}

const Budgets = () => {
  const { userProfile, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      setError(null);
      console.log('Attempting to fetch budgets...');
      
      // Check if user is authenticated
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);

  const handleBudgetAdded = () => {
    fetchBudgets(); // Refresh the budgets list
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă bugetele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Target className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Eroare la încărcarea bugetelor</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={fetchBudgets} variant="outline">
            Încearcă din nou
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
                <Link to="/budgets" className="text-indigo-600 font-medium">
                  Buget
                </Link>
                <Link to="/goals" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bună, {userProfile?.first_name || 'Utilizator'}!</span>
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

        {/* Budgets List or Empty State */}
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
              <Button onClick={() => setShowAddForm(true)} className="mx-auto">
                Creează Primul Buget
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Budget Modal */}
        <AddBudgetForm 
          isOpen={showAddForm} 
          onClose={() => {
            setShowAddForm(false);
            handleBudgetAdded();
          }} 
        />
      </main>
    </div>
  );
};

export default Budgets;
