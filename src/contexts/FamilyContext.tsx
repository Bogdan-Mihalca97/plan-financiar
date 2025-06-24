
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
  createFamily: (name: string) => Promise<FamilyGroup>;
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

  // Add retry logic for network requests
  const retryRequest = async (operation: () => Promise<any>, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  };

  const loadFamilyData = async () => {
    try {
      if (!user || !isAuthenticated) {
        console.log('User not authenticated, skipping family data load');
        setLoading(false);
        return;
      }

      console.log('Loading family data for user:', user.id);

      // Test Supabase connection first
      const { error: connectionError } = await supabase.from('profiles').select('id').limit(1);
      if (connectionError) {
        console.error('Supabase connection test failed:', connectionError);
        throw new Error('Problemă de conectare cu baza de date');
      }

      // Get current user's family membership with retry logic
      const membershipResult = await retryRequest(async () => {
        return await supabase
          .from('family_memberships')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
      });

      const { data: membership, error: membershipError } = membershipResult;

      if (membershipError) {
        console.error('Error loading family membership:', membershipError);
        throw membershipError;
      }

      if (membership) {
        // Get the family group details with retry
        const familyResult = await retryRequest(async () => {
          return await supabase
            .from('family_groups')
            .select('*')
            .eq('id', membership.family_group_id)
            .single();
        });

        const { data: familyGroup, error: familyError } = familyResult;

        if (familyError) {
          console.error('Error loading family group:', familyError);
          throw familyError;
        }

        setCurrentFamily(familyGroup);
        setIsAdmin(membership.role === 'admin');

        // Load all family members
        try {
          const membersResult = await retryRequest(async () => {
            return await supabase
              .from('family_memberships')
              .select('*')
              .eq('family_group_id', familyGroup.id);
          });

          const { data: members, error: membersError } = membersResult;

          if (membersError) {
            console.error('Error loading family members:', membersError);
            setFamilyMembers([]);
          } else if (members) {
            // Get user profiles for each member
            const memberProfiles: FamilyMember[] = [];
            for (const member of members) {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('email, first_name, last_name')
                  .eq('id', member.user_id)
                  .maybeSingle();

                memberProfiles.push({
                  ...member,
                  role: member.role as 'admin' | 'member',
                  email: profile?.email,
                  first_name: profile?.first_name,
                  last_name: profile?.last_name,
                });
              } catch (profileError) {
                console.error('Error loading profile for user:', member.user_id, profileError);
                // Add member without profile info
                memberProfiles.push({
                  ...member,
                  role: member.role as 'admin' | 'member',
                });
              }
            }
            setFamilyMembers(memberProfiles);
          }
        } catch (error) {
          console.error('Error in members loading:', error);
          setFamilyMembers([]);
        }

        // Load pending invitations if user is admin
        if (membership.role === 'admin') {
          try {
            const invitationsResult = await retryRequest(async () => {
              return await supabase
                .from('family_invitations')
                .select('*')
                .eq('family_group_id', familyGroup.id)
                .eq('status', 'pending');
            });

            const { data: invitations, error: invitationsError } = invitationsResult;

            if (invitationsError) {
              console.error('Error loading invitations:', invitationsError);
            } else if (invitations) {
              setFamilyInvitations(invitations.map(inv => ({
                ...inv,
                status: inv.status as 'pending' | 'accepted' | 'declined'
              })));
            }
          } catch (error) {
            console.error('Error loading invitations:', error);
            setFamilyInvitations([]);
          }
        }
      } else {
        // No family membership found
        setCurrentFamily(null);
        setFamilyMembers([]);
        setFamilyInvitations([]);
        setIsAdmin(false);
      }
    } catch (error: any) {
      console.error('Error loading family data:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Nu s-au putut încărca datele familiei';
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Problemă de conectare. Te rugăm să reîncerci în câteva momente.';
      } else if (error.message?.includes('conectare')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Eroare",
        description: errorMessage,
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
    if (!user || !isAuthenticated) {
      throw new Error('Nu ești autentificat');
    }

    console.log('Creating family for user:', user.id, 'with name:', name);

    try {
      // Test connection before creating
      const { error: connectionError } = await supabase.from('profiles').select('id').limit(1);
      if (connectionError) {
        throw new Error('Problemă de conectare cu baza de date');
      }

      // Create the family group with retry logic
      const familyResult = await retryRequest(async () => {
        return await supabase
          .from('family_groups')
          .insert([{ 
            name: name.trim(), 
            created_by: user.id 
          }])
          .select()
          .single();
      });

      const { data: family, error: familyError } = familyResult;

      if (familyError) {
        console.error('Error creating family group:', familyError);
        throw new Error(`Eroare la crearea grupului: ${familyError.message}`);
      }

      if (!family) {
        throw new Error('Nu s-a putut crea grupul familiei');
      }

      console.log('Family created successfully:', family);

      // Add creator as admin member with retry logic
      const membershipResult = await retryRequest(async () => {
        return await supabase
          .from('family_memberships')
          .insert([{
            family_group_id: family.id,
            user_id: user.id,
            role: 'admin'
          }])
          .select()
          .single();
      });

      const { data: membership, error: memberError } = membershipResult;

      if (memberError) {
        console.error('Error creating admin membership:', memberError);
        // Try to cleanup the family group if membership creation fails
        try {
          await supabase.from('family_groups').delete().eq('id', family.id);
        } catch (cleanupError) {
          console.error('Error cleaning up family group:', cleanupError);
        }
        throw new Error(`Eroare la adăugarea ca administrator: ${memberError.message}`);
      }

      console.log('Admin membership created successfully:', membership);

      // Reload family data to reflect changes
      await loadFamilyData();
      
      return family;
    } catch (error: any) {
      console.error('Error in createFamily:', error);
      
      // Handle specific error types
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Problemă de conectare. Te rugăm să reîncerci în câteva momente.');
      }
      
      throw error;
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
        title: "Succes",
        description: "Invitația a fost trimisă cu succes",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut trimite invitația",
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
      if (!isAdmin) {
        throw new Error('Nu ai permisiunea să elimini membri');
      }

      const { error } = await supabase
        .from('family_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Membrul a fost eliminat cu succes",
      });

      await loadFamilyData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut elimina membrul",
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
