
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  period: string;
  user_id: string;
  family_group_id: string | null;
  created_at: string;
  updated_at: string;
}

interface BudgetsContextType {
  budgets: Budget[];
  familyBudgets: Budget[];
  allBudgets: Budget[];
  loading: boolean;
  refreshBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const BudgetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [familyBudgets, setFamilyBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { currentFamily } = useFamily();

  const fetchBudgets = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated, skipping budgets fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching budgets for user:', user.id);
      
      // Fetch personal budgets
      const { data: personalBudgets, error: personalError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (personalError) {
        console.error('Error fetching personal budgets:', personalError);
        throw personalError;
      }

      console.log('Fetched personal budgets:', personalBudgets);
      setBudgets((personalBudgets || []) as Budget[]);

      // Fetch family budgets if user is part of a family
      if (currentFamily) {
        console.log('Fetching family budgets for family:', currentFamily.id);
        
        const { data: familyBuds, error: familyError } = await supabase
          .from('budgets')
          .select('*')
          .eq('family_group_id', currentFamily.id)
          .order('created_at', { ascending: false });

        if (familyError) {
          console.error('Error fetching family budgets:', familyError);
        } else {
          console.log('Fetched family budgets:', familyBuds);
          setFamilyBudgets((familyBuds || []) as Budget[]);
        }
      } else {
        console.log('No family found, skipping family budgets');
        setFamilyBudgets([]);
      }

    } catch (error: any) {
      console.error('Error in fetchBudgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user, isAuthenticated, currentFamily]);

  const allBudgets = [...budgets, ...familyBudgets];

  const addBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('budgets')
      .insert([budget]);

    if (error) throw error;
    await fetchBudgets();
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const { error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchBudgets();
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchBudgets();
  };

  const value: BudgetsContextType = {
    budgets,
    familyBudgets,
    allBudgets,
    loading,
    refreshBudgets: fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };

  return (
    <BudgetsContext.Provider value={value}>
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
};
