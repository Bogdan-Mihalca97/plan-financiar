
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
      
      // Fetch all goals the user can see (own + family members' + family-level)
      const { data: allUserGoals, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        throw error;
      }

      console.log('Fetched all visible goals:', allUserGoals);
      
      // Separate personal/family member goals and family-level goals
      const personalAndMemberGoals = (allUserGoals || []).filter(
        g => !g.family_group_id
      );
      
      const familyLevelGoals = (allUserGoals || []).filter(
        g => g.family_group_id
      );

      setGoals(personalAndMemberGoals as Goal[]);
      setFamilyGoals(familyLevelGoals as Goal[]);

    } catch (error: any) {
      console.error('Error in fetchGoals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    fetchGoals();

    // Subscribe to real-time changes for goals
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        () => {
          console.log('Goal change detected, refreshing data');
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
