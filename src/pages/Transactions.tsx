
import React, { useState, useEffect } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Navigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionsList from "@/components/transactions/TransactionsList";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types/transaction";

const Transactions = () => {
  const { allTransactions, familyTransactions, loading, refreshTransactions } = useTransactions();
  const { currentFamily } = useFamily();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Update filtered transactions when allTransactions changes
  useEffect(() => {
    setFilteredTransactions(allTransactions);
  }, [allTransactions]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă tranzacțiile...</p>
        </div>
      </div>
    );
  }

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tranzacții</h1>
            <p className="text-gray-600 mt-1">
              {filteredTransactions.length} din {allTransactions.length} tranzacții
              {currentFamily && familyTransactions.length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({familyTransactions.length} tranzacții de familie)
                </span>
              )}
            </p>
          </div>
          <AddTransactionButton />
        </div>

        {currentFamily && familyTransactions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-900 font-medium mb-2">
              Tranzacții Familie: {currentFamily.name}
            </h3>
            <p className="text-blue-700 text-sm">
              Poți vedea {familyTransactions.length} tranzacții din familia ta, plus tranzacțiile tale personale.
            </p>
          </div>
        )}

        <TransactionFilters 
          transactions={allTransactions}
          onFilteredTransactions={handleFilteredTransactions}
        />

        <div className="space-y-6">
          <TransactionsList 
            transactions={filteredTransactions} 
            onTransactionUpdated={refreshTransactions}
            onTransactionDeleted={refreshTransactions}
          />
        </div>
      </main>
    </div>
  );
};

export default Transactions;
