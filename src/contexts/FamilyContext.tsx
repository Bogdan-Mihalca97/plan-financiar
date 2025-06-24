import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  email?: string;
  first_name?: string;
  last_name?: string;
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
  familyInvitations: FamilyInvitation[];
  isAdmin: boolean;
  createFamily: (name: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  loading: boolean;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyInvitations, setFamilyInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const loadFamilyData = async () => {
    try {
      if (!user || !isAuthenticated) {
        console.log('User not authenticated, skipping family data load');
        setLoading(false);
        return;
      }

      console.log('Loading family data for user:', user.id);

      // Get current user's family membership
      const { data: membership, error: membershipError } = await supabase
        .from('family_memberships')
        .select(`
          *,
          family_groups (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error('Error loading family membership:', membershipError);
        throw membershipError;
      }

      if (membership && membership.family_groups) {
        setCurrentFamily(membership.family_groups);
        setIsAdmin(membership.role === 'admin');

        // Load family members
        const { data: members, error: membersError } = await supabase
          .from('family_memberships')
          .select('*')
          .eq('family_group_id', membership.family_groups.id);

        if (membersError) {
          console.error('Error loading family members:', membersError);
          throw membersError;
        }

        if (members) {
          // Get user profiles for each member
          const memberProfiles: FamilyMember[] = [];
          for (const member of members) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', member.user_id)
              .single();

            memberProfiles.push({
              ...member,
              role: member.role as 'admin' | 'member',
              email: profile?.email,
              first_name: profile?.first_name,
              last_name: profile?.last_name,
            });
          }
          setFamilyMembers(memberProfiles);
        }

        // Load pending invitations if user is admin
        if (membership.role === 'admin') {
          const { data: invitations, error: invitationsError } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('family_group_id', membership.family_groups.id)
            .eq('status', 'pending');

          if (invitationsError) {
            console.error('Error loading invitations:', invitationsError);
          } else if (invitations) {
            setFamilyInvitations(invitations.map(inv => ({
              ...inv,
              status: inv.status as 'pending' | 'accepted' | 'declined'
            })));
          }
        }
      } else {
        // No family membership found
        setCurrentFamily(null);
        setFamilyMembers([]);
        setFamilyInvitations([]);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca datele familiei",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFamilyData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const createFamily = async (name: string) => {
    try {
      if (!user || !isAuthenticated) {
        throw new Error('Nu ești autentificat');
      }

      console.log('Creating family for user:', user.id, 'with name:', name);

      // Create family group
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (familyError) {
        console.error('Error creating family group:', familyError);
        throw familyError;
      }

      console.log('Family created:', family);

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_memberships')
        .insert([{
          family_group_id: family.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) {
        console.error('Error creating admin membership:', memberError);
        throw memberError;
      }

      console.log('Admin membership created successfully');

      // Reload family data
      await loadFamilyData();
    } catch (error: any) {
      console.error('Error in createFamily:', error);
      throw new Error(error.message || 'Nu s-a putut crea familia');
    }
  };

  const inviteMember = async (email: string) => {
    try {
      if (!user || !currentFamily) throw new Error('User not authenticated or no family');

      const { error } = await supabase
        .from('family_invitations')
        .insert([{
          family_group_id: currentFamily.id,
          email,
          invited_by: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Get invitation details
      const { data: invitation } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) throw new Error('Invitation not found');

      // Add user to family
      const { error: memberError } = await supabase
        .from('family_memberships')
        .insert([{
          family_group_id: invitation.family_group_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Joined family successfully",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation declined",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const leaveFamily = async () => {
    try {
      if (!user || !currentFamily) throw new Error('User not authenticated or no family');

      const { error } = await supabase
        .from('family_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('family_group_id', currentFamily.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Left family successfully",
      });

      setCurrentFamily(null);
      setFamilyMembers([]);
      setFamilyInvitations([]);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error leaving family:', error);
      toast({
        title: "Error",
        description: "Failed to leave family",
        variant: "destructive",
      });
    }
  };

  const refreshFamily = async () => {
    setLoading(true);
    await loadFamilyData();
  };

  const value: FamilyContextType = {
    currentFamily,
    familyMembers,
    familyInvitations,
    isAdmin,
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
