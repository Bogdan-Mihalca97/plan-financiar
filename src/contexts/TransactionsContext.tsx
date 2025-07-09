
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  family_group_id?: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  familyTransactions: Transaction[];
  allTransactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
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
      
      // Fetch personal transactions (without family_group_id or user's own family transactions)
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
      setTransactions(personalTransactions || []);

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
          console.log('Family error details:', familyError);
        } else {
          console.log('Fetched family transactions:', familyTxns);
          setFamilyTransactions(familyTxns || []);
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

  const value: TransactionsContextType = {
    transactions,
    familyTransactions,
    allTransactions,
    loading,
    refreshTransactions: fetchTransactions,
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
