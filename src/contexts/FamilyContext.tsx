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
  role: string;
  joined_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_creator?: boolean;
}

export interface FamilyInvitation {
  id: string;
  family_group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
  family_name?: string;
  inviter_name?: string;
}

interface FamilyContextType {
  currentFamily: FamilyGroup | null;
  familyMembers: FamilyMember[];
  familyInvitations: FamilyInvitation[];
  pendingInvitations: FamilyInvitation[];
  isCreator: boolean;
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
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, userProfile } = useAuth();

  const loadFamilyData = async () => {
    if (!user || !isAuthenticated) {
      console.log('User not authenticated, skipping family data load');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading family data for user:', user.id);

      // Get user's family membership
      const { data: membership, error: membershipError } = await supabase
        .from('family_memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Error loading family membership:', membershipError);
        throw membershipError;
      }

      if (membership) {
        // Get the family group details
        const { data: familyGroup, error: familyError } = await supabase
          .from('family_groups')
          .select('*')
          .eq('id', membership.family_group_id)
          .single();

        if (familyError) {
          console.error('Error loading family group:', familyError);
          throw familyError;
        }

        setCurrentFamily(familyGroup);
        setIsCreator(membership.role === 'admin');

        // Load all family members for this group
        const { data: allMemberships, error: membersError } = await supabase
          .from('family_memberships')
          .select('*')
          .eq('family_group_id', familyGroup.id);

        if (membersError) {
          console.error('Error loading family members:', membersError);
        } else if (allMemberships) {
          // Get user profiles for each member
          const memberProfiles: FamilyMember[] = [];
          for (const member of allMemberships) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, first_name, last_name')
                .eq('id', member.user_id)
                .maybeSingle();

              memberProfiles.push({
                ...member,
                email: profile?.email,
                first_name: profile?.first_name,
                last_name: profile?.last_name,
                is_creator: member.role === 'admin',
              });
            } catch (profileError) {
              console.error('Error loading profile for user:', member.user_id, profileError);
              memberProfiles.push({
                ...member,
                is_creator: member.role === 'admin',
              });
            }
          }
          setFamilyMembers(memberProfiles);
        }

        // Load pending invitations if user is admin
        if (membership.role === 'admin') {
          const { data: invitations, error: invitationsError } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('family_group_id', familyGroup.id)
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
        // No family membership found - check for pending invitations
        if (userProfile?.email) {
          const { data: pendingInvitations, error: pendingError } = await supabase
            .from('family_invitations')
            .select(`
              *,
              family_groups!inner(name),
              inviter_profiles:profiles!family_invitations_invited_by_fkey(first_name, last_name)
            `)
            .eq('email', userProfile.email)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString());

          if (pendingError) {
            console.error('Error loading pending invitations:', pendingError);
          } else if (pendingInvitations && pendingInvitations.length > 0) {
            console.log('Found pending invitations for user:', pendingInvitations);
            
            const formattedInvitations = pendingInvitations.map(inv => ({
              ...inv,
              status: inv.status as 'pending' | 'accepted' | 'declined',
              family_name: (inv as any).family_groups?.name || 'Familie necunoscută',
              inviter_name: (inv as any).inviter_profiles 
                ? `${(inv as any).inviter_profiles.first_name} ${(inv as any).inviter_profiles.last_name}`.trim()
                : 'Administrator'
            }));

            setPendingInvitations(formattedInvitations);

            // Show notification for pending invitations
            toast({
              title: "Invitații în așteptare",
              description: `Ai ${pendingInvitations.length} invitație${pendingInvitations.length > 1 ? 'i' : ''} de alăturare la familie în așteptare.`,
            });
          }
        }

        setCurrentFamily(null);
        setFamilyMembers([]);
        setFamilyInvitations([]);
        setIsCreator(false);
      }
    } catch (error: any) {
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
    if (isAuthenticated && user && userProfile) {
      loadFamilyData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated, userProfile]);

  const createFamily = async (name: string) => {
    if (!user || !isAuthenticated) {
      throw new Error('Nu ești autentificat');
    }

    console.log('Creating family for user:', user.id, 'with name:', name);

    try {
      // Create the family group
      const { data: family, error: familyError } = await supabase
        .from('family_groups')
        .insert([{ 
          name: name.trim(), 
          created_by: user.id 
        }])
        .select()
        .single();

      if (familyError) {
        console.error('Error creating family group:', familyError);
        throw new Error(`Eroare la crearea grupului: ${familyError.message}`);
      }

      if (!family) {
        throw new Error('Nu s-a putut crea grupul familiei');
      }

      console.log('Family created successfully:', family);

      // Add creator as admin member
      const { data: membership, error: memberError } = await supabase
        .from('family_memberships')
        .insert([{
          family_group_id: family.id,
          user_id: user.id,
          role: 'admin'
        }])
        .select()
        .single();

      if (memberError) {
        console.error('Error creating membership:', memberError);
        
        // Try to cleanup the family group if membership creation fails
        try {
          await supabase.from('family_groups').delete().eq('id', family.id);
        } catch (cleanupError) {
          console.error('Error cleaning up family group:', cleanupError);
        }
        
        throw new Error(`Eroare la adăugarea ca membru: ${memberError.message}`);
      }

      console.log('Membership created successfully:', membership);

      // Reload family data to reflect changes
      await loadFamilyData();
      
      return family;
    } catch (error: any) {
      console.error('Error in createFamily:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Problemă de conectare. Te rugăm să reîncerci în câteva momente.');
      }
      
      throw error;
    }
  };

  const inviteMember = async (email: string) => {
    try {
      if (!user || !currentFamily) {
        throw new Error('Nu ești autentificat sau nu ai o familie');
      }

      if (!isCreator) {
        throw new Error('Doar administratorii pot invita membri noi');
      }

      console.log('Inviting member:', email, 'to family:', currentFamily.id);

      // Check if user already exists in family
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existingProfile) {
        const { data: existingMember } = await supabase
          .from('family_memberships')
          .select('*')
          .eq('family_group_id', currentFamily.id)
          .eq('user_id', existingProfile.id)
          .maybeSingle();

        if (existingMember) {
          throw new Error('Acest utilizator este deja membru al familiei');
        }
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('family_group_id', currentFamily.id)
        .eq('email', email.toLowerCase().trim())
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvitation) {
        throw new Error('Această adresă de email a fost deja invitată');
      }

      const { data, error } = await supabase
        .from('family_invitations')
        .insert([{
          family_group_id: currentFamily.id,
          email: email.toLowerCase().trim(),
          invited_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inviting member:', error);
        throw new Error(error.message || 'Eroare la trimiterea invitației');
      }

      console.log('Invitation created successfully:', data);

      // TEMPORAR: Dezactivez trimiterea de email pentru testare
      console.log('Email sending disabled for testing - invitation created successfully');
      
      toast({
        title: "Succes",
        description: "Invitația a fost creată cu succes în baza de date",
      });

      await loadFamilyData();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      if (!user) throw new Error('Nu ești autentificat');

      const { data: invitation } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) throw new Error('Invitația nu a fost găsită');

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('family_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('family_group_id', invitation.family_group_id)
        .maybeSingle();

      if (existingMembership) {
        throw new Error('Ești deja membru al acestei familii');
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('family_memberships')
        .insert([{
          family_group_id: invitation.family_group_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        console.error('Error creating membership:', memberError);
        throw new Error('Nu s-a putut crea apartenența la familie');
      }

      // Update invitation status
      const { error: invitationError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (invitationError) {
        console.error('Error updating invitation:', invitationError);
      }

      toast({
        title: "Succes",
        description: "Te-ai alăturat familiei cu succes",
      });

      await loadFamilyData();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut accepta invitația",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      toast({
        title: "Succes",
        description: "Invitația a fost refuzată",
      });

      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut refuza invitația",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      if (!isCreator) {
        throw new Error('Doar administratorii familiei pot elimina membri');
      }

      await supabase
        .from('family_memberships')
        .delete()
        .eq('id', memberId);

      toast({
        title: "Succes",
        description: "Membrul a fost eliminat cu succes",
      });

      await loadFamilyData();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut elimina membrul",
        variant: "destructive",
      });
    }
  };

  const leaveFamily = async () => {
    try {
      if (!user || !currentFamily) throw new Error('Nu ești autentificat sau nu ai o familie');

      await supabase
        .from('family_memberships')
        .delete()
        .eq('user_id', user.id)
        .eq('family_group_id', currentFamily.id);

      toast({
        title: "Succes",
        description: "Ai părăsit familia cu succes",
      });

      setCurrentFamily(null);
      setFamilyMembers([]);
      setFamilyInvitations([]);
      setIsCreator(false);
    } catch (error) {
      console.error('Error leaving family:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut părăsi familia",
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
