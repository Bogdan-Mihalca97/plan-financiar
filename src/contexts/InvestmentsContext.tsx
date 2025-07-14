import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';

interface Investment {
  id: string;
  name: string;
  type: string;
  symbol: string | null;
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  created_at: string;
  user_id: string;
  family_group_id: string | null;
}

interface InvestmentsContextType {
  investments: Investment[];
  familyInvestments: Investment[];
  allInvestments: Investment[];
  loading: boolean;
  refreshInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined);

export const InvestmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [familyInvestments, setFamilyInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { currentFamily } = useFamily();

  const fetchInvestments = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated, skipping investments fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching investments for user:', user.id);
      
      // Fetch all investments the user can see (own + family members' + family-level)
      const { data: allUserInvestments, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investments:', error);
        throw error;
      }

      console.log('Fetched all visible investments:', allUserInvestments);
      
      // Separate personal/family member investments and family-level investments
      const personalAndMemberInvestments = (allUserInvestments || []).filter(
        i => !i.family_group_id
      );
      
      const familyLevelInvestments = (allUserInvestments || []).filter(
        i => i.family_group_id
      );

      setInvestments(personalAndMemberInvestments as Investment[]);
      setFamilyInvestments(familyLevelInvestments as Investment[]);

    } catch (error: any) {
      console.error('Error in fetchInvestments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user, isAuthenticated, currentFamily]);

  const allInvestments = [...investments, ...familyInvestments];

  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('investments')
      .insert([investment]);

    if (error) throw error;
    await fetchInvestments();
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const { error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchInvestments();
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchInvestments();
  };

  const value: InvestmentsContextType = {
    investments,
    familyInvestments,
    allInvestments,
    loading,
    refreshInvestments: fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };

  return (
    <InvestmentsContext.Provider value={value}>
      {children}
    </InvestmentsContext.Provider>
  );
};

export const useInvestments = () => {
  const context = useContext(InvestmentsContext);
  if (context === undefined) {
    throw new Error('useInvestments must be used within an InvestmentsProvider');
  }
  return context;
};
