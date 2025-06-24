import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getTransactionsByCategory: () => Record<string, number>;
  loading: boolean;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

interface TransactionsProviderProps {
  children: ReactNode;
}

// Helper function to transform Supabase data to our Transaction interface
const transformSupabaseTransaction = (data: any): Transaction => ({
  id: data.id,
  date: data.date,
  description: data.description,
  amount: Number(data.amount),
  type: data.type as "income" | "expense",
  category: data.category
});

export const TransactionsProvider: React.FC<TransactionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      // If user is part of a family, fetch family transactions too
      if (currentFamily) {
        query = query.or(`user_id.eq.${user.id},family_group_id.eq.${currentFamily.id}`);
      } else {
        query = query.eq('user_id', user.id).is('family_group_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = (data || []).map(transformSupabaseTransaction);
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, currentFamily?.id]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User must be authenticated');

    const transactionData = {
      ...transaction,
      user_id: user.id,
      amount: Number(transaction.amount),
      family_group_id: currentFamily?.id || null
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;

    const transformedData = transformSupabaseTransaction(data);
    setTransactions(prev => [transformedData, ...prev]);
  };

  const addTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!user) throw new Error('User must be authenticated');

    const transactionsWithUserId = newTransactions.map(transaction => ({
      ...transaction,
      user_id: user.id,
      amount: Number(transaction.amount),
      family_group_id: currentFamily?.id || null
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionsWithUserId)
      .select();

    if (error) throw error;

    const transformedData = (data || []).map(transformSupabaseTransaction);
    setTransactions(prev => [...transformedData, ...prev]);
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) throw new Error('User must be authenticated');

    const updateData: any = { ...updatedTransaction };
    if (updateData.amount !== undefined) {
      updateData.amount = Number(updateData.amount);
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const transformedData = transformSupabaseTransaction(data);
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? transformedData : transaction
    ));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getTransactionsByCategory = () => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const refreshTransactions = async () => {
    await fetchTransactions();
  };

  const value: TransactionsContextType = {
    transactions,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getTransactionsByCategory,
    loading,
    refreshTransactions
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
