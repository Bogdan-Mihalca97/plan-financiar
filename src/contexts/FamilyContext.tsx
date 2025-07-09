
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyGroup, FamilyMember, FamilyInvitation, FamilyContextType } from '@/types/family';
import { useFamilyData } from '@/hooks/useFamilyData';
import { useFamilyActions } from '@/hooks/useFamilyActions';

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyInvitations, setFamilyInvitations] = useState<FamilyInvitation[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const { user, isAuthenticated, userProfile } = useAuth();

  const { loadFamilyData } = useFamilyData(
    setCurrentFamily,
    setFamilyMembers,
    setFamilyInvitations,
    setPendingInvitations,
    setIsCreator,
    setLoading
  );

  const {
    createFamily,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    leaveFamily
  } = useFamilyActions(
    currentFamily,
    isCreator,
    loadFamilyData,
    setPendingInvitations,
    setCurrentFamily,
    setFamilyMembers,
    setFamilyInvitations,
    setIsCreator
  );

  useEffect(() => {
    if (isAuthenticated && user && userProfile) {
      console.log('🔄 Auth state ready, loading family data');
      loadFamilyData();
    } else {
      console.log('⏳ Waiting for auth state or user profile');
      setLoading(false);
    }
  }, [user, isAuthenticated, userProfile]);

  const refreshFamily = async () => {
    setLoading(true);
    await loadFamilyData();
  };

  const value: FamilyContextType = {
    currentFamily,
    familyMembers,
    familyInvitations,
    pendingInvitations,
    isCreator,
    createFamily,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    leaveFamily,
    loading,
    refreshFamily,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
