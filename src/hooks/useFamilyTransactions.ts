
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Transaction } from '@/types/transaction';

export const useFamilyTransactions = () => {
  const [familyTransactions, setFamilyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const loadFamilyTransactions = async () => {
    if (!user || !currentFamily) {
      console.log('🔍 No user or family, skipping family transactions load');
      setFamilyTransactions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Loading family transactions for family:', currentFamily.id);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('family_group_id', currentFamily.id)
        .order('date', { ascending: false });

      console.log('🔍 Family transactions query result:', { transactions, error });

      if (error) {
        console.error('❌ Error loading family transactions:', error);
        throw error;
      }

      setFamilyTransactions(transactions || []);
    } catch (error) {
      console.error('❌ Error in loadFamilyTransactions:', error);
      setFamilyTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyTransactions();
  }, [user, currentFamily]);

  return {
    familyTransactions,
    loading,
    refreshFamilyTransactions: loadFamilyTransactions
  };
};
