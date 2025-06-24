
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import ImportCSVForm from "@/components/transactions/ImportCSVForm";
import TransactionsList from "@/components/transactions/TransactionsList";

const Transactions = () => {
  const { isAuthenticated, loading } = useAuth();
  const { transactions, addTransactions } = useTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTransactionsImported = (importedTransactions: Omit<import("@/contexts/TransactionsContext").Transaction, 'id'>[]) => {
    addTransactions(importedTransactions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă tranzacțiile...</p>
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
            <h2 className="text-3xl font-bold text-gray-900">Tranzacții</h2>
            <p className="text-gray-600">Gestionează toate tranzacțiile tale</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowImportForm(true)} variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adaugă Tranzacție
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrare și Căutare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Caută tranzacții..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrează
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionsList searchTerm={searchTerm} transactions={transactions} />

        {/* Add Transaction Modal */}
        <AddTransactionForm 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)} 
        />

        {/* Import CSV Modal */}
        <ImportCSVForm 
          isOpen={showImportForm} 
          onClose={() => setShowImportForm(false)}
          onTransactionsImported={handleTransactionsImported}
        />
      </main>
    </div>
  );
};

export default Transactions;
