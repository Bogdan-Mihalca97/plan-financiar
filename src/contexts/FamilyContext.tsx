
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface FamilyInvitation {
  id: string;
  family_group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
}

interface FamilyContextType {
  currentFamily: FamilyGroup | null;
  familyMembers: FamilyMember[];
  pendingInvitations: FamilyInvitation[];
  userFamilies: FamilyGroup[];
  createFamilyGroup: (name: string) => Promise<void>;
  inviteFamilyMember: (email: string) => Promise<void>;
  switchFamily: (familyId: string) => void;
  loading: boolean;
  refreshFamilyData: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

interface FamilyProviderProps {
  children: ReactNode;
}

export const FamilyProvider: React.FC<FamilyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [userFamilies, setUserFamilies] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserFamilies = async () => {
    if (!user) return;

    try {
      // Get all families the user belongs to
      const { data: memberships, error: membershipsError } = await supabase
        .from('family_memberships')
        .select(`
          family_group_id,
          role,
          family_groups (
            id,
            name,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      const families = (memberships || []).map(m => m.family_groups).filter(Boolean) as FamilyGroup[];
      setUserFamilies(families);

      // Set the first family as current if none is selected
      if (families.length > 0 && !currentFamily) {
        setCurrentFamily(families[0]);
      }
    } catch (error) {
      console.error('Error fetching user families:', error);
    }
  };

  const fetchFamilyMembers = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_memberships')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq('family_group_id', familyId);

      if (error) throw error;

      const members = (data || []).map(member => ({
        ...member,
        profile: member.profiles
      }));
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const fetchPendingInvitations = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('family_group_id', familyId)
        .eq('status', 'pending');

      if (error) throw error;

      setPendingInvitations(data || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const refreshFamilyData = async () => {
    if (!user) return;

    setLoading(true);
    await fetchUserFamilies();
    
    if (currentFamily) {
      await Promise.all([
        fetchFamilyMembers(currentFamily.id),
        fetchPendingInvitations(currentFamily.id)
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshFamilyData();
  }, [user, currentFamily?.id]);

  const createFamilyGroup = async (name: string) => {
    if (!user) throw new Error('User must be authenticated');

    const { data: familyGroup, error: familyError } = await supabase
      .from('family_groups')
      .insert([{
        name,
        created_by: user.id
      }])
      .select()
      .single();

    if (familyError) throw familyError;

    // Add the creator as an admin member
    const { error: membershipError } = await supabase
      .from('family_memberships')
      .insert([{
        family_group_id: familyGroup.id,
        user_id: user.id,
        role: 'admin'
      }]);

    if (membershipError) throw membershipError;

    await refreshFamilyData();
    setCurrentFamily(familyGroup);
  };

  const inviteFamilyMember = async (email: string) => {
    if (!user || !currentFamily) throw new Error('User and family must be set');

    const { error } = await supabase
      .from('family_invitations')
      .insert([{
        family_group_id: currentFamily.id,
        email,
        invited_by: user.id
      }]);

    if (error) throw error;

    await fetchPendingInvitations(currentFamily.id);
  };

  const switchFamily = (familyId: string) => {
    const family = userFamilies.find(f => f.id === familyId);
    if (family) {
      setCurrentFamily(family);
    }
  };

  const value: FamilyContextType = {
    currentFamily,
    familyMembers,
    pendingInvitations,
    userFamilies,
    createFamilyGroup,
    inviteFamilyMember,
    switchFamily,
    loading,
    refreshFamilyData
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};
