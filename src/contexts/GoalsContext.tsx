
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string | null;
  priority: string | null;
  is_completed: boolean;
  user_id: string;
  family_group_id: string | null;
  created_at: string;
  updated_at: string;
}

interface GoalsContextType {
  goals: Goal[];
  familyGoals: Goal[];
  allGoals: Goal[];
  loading: boolean;
  refreshGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [familyGoals, setFamilyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { currentFamily } = useFamily();

  const fetchGoals = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated, skipping goals fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching goals for user:', user.id);
      
      // Fetch personal goals
      const { data: personalGoals, error: personalError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (personalError) {
        console.error('Error fetching personal goals:', personalError);
        throw personalError;
      }

      console.log('Fetched personal goals:', personalGoals);
      setGoals((personalGoals || []) as Goal[]);

      // Fetch family goals if user is part of a family
      if (currentFamily) {
        console.log('Fetching family goals for family:', currentFamily.id);
        
        const { data: familyGls, error: familyError } = await supabase
          .from('goals')
          .select('*')
          .eq('family_group_id', currentFamily.id)
          .order('created_at', { ascending: false });

        if (familyError) {
          console.error('Error fetching family goals:', familyError);
        } else {
          console.log('Fetched family goals:', familyGls);
          setFamilyGoals((familyGls || []) as Goal[]);
        }
      } else {
        console.log('No family found, skipping family goals');
        setFamilyGoals([]);
      }

    } catch (error: any) {
      console.error('Error in fetchGoals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, isAuthenticated, currentFamily]);

  const allGoals = [...goals, ...familyGoals];

  const addGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('goals')
      .insert([goal]);

    if (error) throw error;
    await fetchGoals();
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchGoals();
  };

  const value: GoalsContextType = {
    goals,
    familyGoals,
    allGoals,
    loading,
    refreshGoals: fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
