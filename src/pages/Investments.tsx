import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/contexts/InvestmentsContext";
import { useFamily } from "@/contexts/FamilyContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddInvestmentForm from "@/components/investments/AddInvestmentForm";
import RefreshPricesButton from "@/components/investments/RefreshPricesButton";
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
} from "@/components/ui/alert-dialog";

const Investments = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { allInvestments, familyInvestments, loading, deleteInvestment, refreshInvestments } = useInvestments();
  const { currentFamily } = useFamily();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (investment: any) => {
    setInvestmentToDelete(investment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!investmentToDelete) return;

    setDeleting(true);
    try {
      await deleteInvestment(investmentToDelete.id);
      toast({
        title: "Investiție ștearsă!",
        description: `${investmentToDelete.name} a fost ștearsă cu succes.`,
      });
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergerea investiției.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setInvestmentToDelete(null);
    }
  };

  const totalInvested = allInvestments.reduce((sum, inv) => sum + (inv.purchase_price * inv.quantity), 0);
  const currentValue = allInvestments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const handleInvestmentAdded = () => {
    refreshInvestments();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Se încarcă investițiile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Investiții</h2>
            <p className="text-gray-600">
              Gestionează și urmărește portofoliul tău de investiții
              {currentFamily && familyInvestments.length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({familyInvestments.length} investiții de familie)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <RefreshPricesButton 
              investments={allInvestments}
              onRefresh={refreshInvestments}
            />
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adaugă Investiție
            </Button>
          </div>
        </div>

        {currentFamily && familyInvestments.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-900 font-medium mb-2">
              Investiții Familie: {currentFamily.name}
            </h3>
            <p className="text-blue-700 text-sm">
              Poți vedea {familyInvestments.length} investiții din familia ta, plus investițiile tale personale.
            </p>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvested.toFixed(2)} Lei</div>
              <p className="text-xs text-muted-foreground">{investments.length} investiții</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoare Curentă</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentValue.toFixed(2)} Lei</div>
              <p className="text-xs text-muted-foreground">Valoarea portofoliului</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Pierdere</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)} Lei
              </div>
              <p className="text-xs text-muted-foreground">
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Randament</CardTitle>
              {totalGainLossPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercentage >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Total return</p>
            </CardContent>
          </Card>
        </div>

        {/* Investments List or Empty State */}
        {allInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allInvestments.map((investment) => {
              const totalCost = investment.purchase_price * investment.quantity;
              const currentVal = investment.current_price * investment.quantity;
              const gainLoss = currentVal - totalCost;
              const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
              
              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{investment.name}</span>
                      <div className="flex items-center gap-2">
                        {investment.symbol && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {investment.symbol}
                          </span>
                        )}
                        {investment.family_group_id && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Familie
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(investment)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{investment.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cantitate:</span>
                        <span className="font-semibold">{investment.quantity}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preț cumpărare:</span>
                        <span className="font-semibold">{investment.purchase_price.toFixed(2)} Lei</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preț curent:</span>
                        <span className="font-semibold">{investment.current_price.toFixed(2)} Lei</span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Valoare totală:</span>
                          <span className="font-semibold">{currentVal.toFixed(2)} Lei</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Profit/Pierdere:</span>
                          <span className={`font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)} Lei ({gainLoss >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center">
                        Cumpărat: {new Date(investment.purchase_date).toLocaleDateString('ro-RO')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu ai încă investiții</h3>
              <p className="text-gray-500 mb-6">
                Începe să investești banii economisiți pentru a-ți construi un portofoliu diversificat.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Prima Investiție
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Investment Modal */}
        <AddInvestmentForm 
          isOpen={showAddForm} 
          onClose={() => {
            setShowAddForm(false);
            handleInvestmentAdded();
          }} 
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Șterge Investiția</AlertDialogTitle>
              <AlertDialogDescription>
                Ești sigur că vrei să ștergi investiția "{investmentToDelete?.name}"? 
                Această acțiune nu poate fi anulată.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulează</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Se șterge..." : "Șterge"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Investments;
