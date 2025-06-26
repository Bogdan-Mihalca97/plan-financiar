
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, PiggyBank, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddBudgetForm from "@/components/budgets/AddBudgetForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
  created_at: string;
}

const Budgets = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { getTransactionsByCategory } = useTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get monthly expense data from transactions
  const monthlyExpensesByCategory = getTransactionsByCategory();

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
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      toast({
        title: "Buget șters",
        description: "Bugetul a fost șters cu succes.",
      });
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Eroare la ștergerea bugetului",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit_amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = monthlyExpensesByCategory[budget.category] || 0;
    return sum + spent;
  }, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleBudgetAdded = () => {
    fetchBudgets();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă bugetele...</p>
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
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <CardTitle className="text-sm font-medium">Cheltuit Luna Aceasta</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpent.toFixed(2)} Lei</div>
              <p className="text-xs text-muted-foreground">
                {totalSpent > 0 ? 'Din bugetele tale' : 'Nu ai cheltuieli înregistrate'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rămas</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : ''}`}>
                {totalRemaining.toFixed(2)} Lei
              </div>
              <p className="text-xs text-muted-foreground">
                {totalRemaining < 0 ? 'Buget depășit!' : 'Din bugetele tale'}
              </p>
            </CardContent>
          </Card>
        </div>

        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const spent = monthlyExpensesByCategory[budget.category] || 0;
              const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
              const isOverBudget = percentage > 100;
              const remaining = budget.limit_amount - spent;
              
              return (
                <Card key={budget.id} className={isOverBudget ? 'border-red-200 bg-red-50' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{budget.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-normal text-gray-500">
                          {budget.period === 'monthly' ? 'Lunar' : 'Anual'}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Șterge Bugetul</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ești sigur că vrei să ștergi bugetul pentru categoria "{budget.category}"? 
                                Această acțiune nu poate fi anulată.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBudget(budget.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Șterge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
                        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : ''}`}>
                          {spent.toFixed(2)} Lei
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rămas:</span>
                        <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {remaining.toFixed(2)} Lei
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-500' : 
                            percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isOverBudget && (
                        <div className="bg-red-100 border border-red-200 rounded p-1">
                          <div className="h-1 bg-red-500 rounded-full" style={{ width: `${Math.min(percentage - 100, 100)}%` }} />
                        </div>
                      )}
                      <p className={`text-xs text-center ${isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {percentage.toFixed(1)}% din buget folosit
                        {isOverBudget && ' (Depășit!)'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
