
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Transaction } from '@/types/transaction';

interface TransactionsContextType {
  transactions: Transaction[];
  familyTransactions: Transaction[];
  allTransactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getMonthlyBalance: () => number;
  getTransactionsByCategory: () => { [key: string]: number };
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [familyTransactions, setFamilyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { currentFamily } = useFamily();

  const fetchTransactions = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated, skipping transactions fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching transactions for user:', user.id);
      
      // Fetch personal transactions
      const { data: personalTransactions, error: personalError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (personalError) {
        console.error('Error fetching personal transactions:', personalError);
        throw personalError;
      }

      console.log('Fetched personal transactions:', personalTransactions);
      setTransactions((personalTransactions || []) as Transaction[]);

      // Fetch family transactions if user is part of a family
      if (currentFamily) {
        console.log('Fetching family transactions for family:', currentFamily.id);
        
        const { data: familyTxns, error: familyError } = await supabase
          .from('transactions')
          .select('*')
          .eq('family_group_id', currentFamily.id)
          .order('date', { ascending: false });

        if (familyError) {
          console.error('Error fetching family transactions:', familyError);
        } else {
          console.log('Fetched family transactions:', familyTxns);
          setFamilyTransactions((familyTxns || []) as Transaction[]);
        }
      } else {
        console.log('No family found, skipping family transactions');
        setFamilyTransactions([]);
      }

    } catch (error: any) {
      console.error('Error in fetchTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, isAuthenticated, currentFamily]);

  const allTransactions = [...transactions, ...familyTransactions];

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert([transaction]);

    if (error) throw error;
    await fetchTransactions();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchTransactions();
  };

  const getTotalIncome = () => {
    return allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => getTotalIncome() - getTotalExpenses();

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return allTransactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return allTransactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyBalance = () => getMonthlyIncome() - getMonthlyExpenses();

  const getTransactionsByCategory = () => {
    return allTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  const value: TransactionsContextType = {
    transactions,
    familyTransactions,
    allTransactions,
    loading,
    refreshTransactions: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlyBalance,
    getTransactionsByCategory,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
