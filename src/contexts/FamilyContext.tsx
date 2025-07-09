
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Prevent multiple simultaneous loads
  const loadingRef = useRef(false);

  const cleanupOrphanedMembership = async (membershipId: string) => {
    try {
      console.log('🧹 Cleaning up orphaned membership:', membershipId);
      
      const { error } = await supabase
        .from('family_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) {
        console.error('❌ Error cleaning up orphaned membership:', error);
      } else {
        console.log('✅ Successfully cleaned up orphaned membership');
        toast({
          title: "Curățare automată",
          description: "Am eliminat o apartenență invalidă la familie.",
        });
      }
    } catch (error) {
      console.error('❌ Error in cleanup:', error);
    }
  };

  const loadFamilyData = async () => {
    if (!user || !isAuthenticated || loadingRef.current) {
      console.log('🔍 User not authenticated or already loading, skipping family data load');
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous loads
    loadingRef.current = true;

    try {
      console.log('🔍 Loading family data for user:', user.id);
      console.log('🔍 User profile:', userProfile);

      // Get user's family membership
      const { data: membership, error: membershipError } = await supabase
        .from('family_memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🔍 Membership query result:', { membership, membershipError });

      if (membershipError) {
        console.error('❌ Error loading family membership:', membershipError);
        throw membershipError;
      }

      if (membership) {
        console.log('✅ User has family membership:', membership);
        console.log('🔍 Looking for family with ID:', membership.family_group_id);

        // Get the family group details - let's debug why this fails
        const { data: familyGroup, error: familyError } = await supabase
          .from('family_groups')
          .select('*')
          .eq('id', membership.family_group_id)
          .maybeSingle();

        console.log('🔍 Family group query result:', { 
          familyGroup, 
          familyError,
          searchingForId: membership.family_group_id 
        });

        // Let's also check what family groups exist for this user
        const { data: allFamilyGroups, error: allFamilyError } = await supabase
          .from('family_groups')
          .select('*');

        console.log('🔍 All family groups in database:', { allFamilyGroups, allFamilyError });

        if (familyError) {
          console.error('❌ Error loading family group:', familyError);
          throw familyError;
        }

        if (!familyGroup) {
          console.error('❌ Family group not found for membership:', membership);
          console.log('🧹 Will clean up orphaned membership and continue without family');
          
          // Clean up orphaned membership
          await cleanupOrphanedMembership(membership.id);
          
          // Continue as if user has no family
          setCurrentFamily(null);
          setFamilyMembers([]);
          setFamilyInvitations([]);
          setIsCreator(false);
          
          // Check for pending invitations
          await loadPendingInvitations();
          return;
        }

        console.log('✅ Family group loaded:', familyGroup);
        setCurrentFamily(familyGroup);
        setIsCreator(membership.role === 'admin');

        // Load all family members for this group
        const { data: allMemberships, error: membersError } = await supabase
          .from('family_memberships')
          .select('*')
          .eq('family_group_id', familyGroup.id);

        console.log('🔍 All memberships query result:', { allMemberships, membersError });

        if (membersError) {
          console.error('❌ Error loading family members:', membersError);
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
              console.error('❌ Error loading profile for user:', member.user_id, profileError);
              memberProfiles.push({
                ...member,
                is_creator: member.role === 'admin',
              });
            }
          }
          console.log('✅ Member profiles loaded:', memberProfiles);
          setFamilyMembers(memberProfiles);
        }

        // Load pending invitations if user is admin
        if (membership.role === 'admin') {
          console.log('🔍 Loading invitations for admin user');
          const { data: invitations, error: invitationsError } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('family_group_id', familyGroup.id)
            .eq('status', 'pending');

          console.log('🔍 Admin invitations query result:', { invitations, invitationsError });

          if (invitationsError) {
            console.error('❌ Error loading invitations:', invitationsError);
          } else if (invitations) {
            setFamilyInvitations(invitations.map(inv => ({
              ...inv,
              status: inv.status as 'pending' | 'accepted' | 'declined'
            })));
          }
        }
      } else {
        // No family membership found - check for pending invitations
        console.log('🔍 No family membership found, checking for pending invitations...');
        
        setCurrentFamily(null);
        setFamilyMembers([]);
        setFamilyInvitations([]);
        setIsCreator(false);
        
        await loadPendingInvitations();
      }
    } catch (error: any) {
      console.error('❌ Error loading family data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca datele familiei",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadPendingInvitations = async () => {
    if (userProfile?.email) {
      console.log('🔍 User email from profile:', userProfile.email);
      
      // Check for pending invitations using the email from profile
      const { data: pendingInvitations, error: pendingError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('email', userProfile.email.toLowerCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      console.log('🔍 Pending invitations query result:', { 
        email: userProfile.email.toLowerCase(),
        pendingInvitations, 
        pendingError 
      });

      if (pendingError) {
        console.error('❌ Error loading pending invitations:', pendingError);
      } else if (pendingInvitations && pendingInvitations.length > 0) {
        console.log('✅ Found pending invitations:', pendingInvitations);
        
        // Get additional details for each invitation
        const enrichedInvitations = [];
        for (const invitation of pendingInvitations) {
          try {
            console.log('🔍 Enriching invitation:', invitation.id);
            
            // Get family name
            const { data: family } = await supabase
              .from('family_groups')
              .select('name')
              .eq('id', invitation.family_group_id)
              .maybeSingle();

            console.log('🔍 Family for invitation:', family);

            // Get inviter name
            const { data: inviterProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', invitation.invited_by)
              .maybeSingle();

            console.log('🔍 Inviter profile:', inviterProfile);

            enrichedInvitations.push({
              ...invitation,
              status: invitation.status as 'pending' | 'accepted' | 'declined',
              family_name: family?.name || 'Familie necunoscută',
              inviter_name: inviterProfile 
                ? `${inviterProfile.first_name} ${inviterProfile.last_name}`.trim()
                : 'Administrator'
            });
          } catch (error) {
            console.error('❌ Error enriching invitation:', error);
            enrichedInvitations.push({
              ...invitation,
              status: invitation.status as 'pending' | 'accepted' | 'declined',
              family_name: 'Familie necunoscută',
              inviter_name: 'Administrator'
            });
          }
        }

        console.log('✅ Enriched invitations:', enrichedInvitations);
        setPendingInvitations(enrichedInvitations);

        // Show notification for pending invitations
        if (enrichedInvitations.length > 0) {
          toast({
            title: "Invitații în așteptare",
            description: `Ai ${enrichedInvitations.length} invitație${enrichedInvitations.length > 1 ? 'i' : ''} de alăturare la familie în așteptare.`,
          });
        }
      } else {
        console.log('ℹ️ No pending invitations found');
        setPendingInvitations([]);
      }
    } else {
      console.log('⚠️ No user email found in profile');
      setPendingInvitations([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && userProfile && !loadingRef.current) {
      console.log('🔄 Auth state ready, loading family data');
      loadFamilyData();
    } else {
      console.log('⏳ Waiting for auth state or user profile, or already loading');
      if (!loadingRef.current) {
        setLoading(false);
      }
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

      console.log('🔄 Accepting invitation:', invitationId);

      const { data: invitation } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) throw new Error('Invitația nu a fost găsită');

      console.log('✅ Found invitation:', invitation);

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('family_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('family_group_id', invitation.family_group_id)
        .maybeSingle();

      if (existingMembership) {
        console.log('⚠️ User already member of family');
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
        console.error('❌ Error creating membership:', memberError);
        throw new Error('Nu s-a putut crea apartenența la familie');
      }

      console.log('✅ Membership created successfully');

      // Update invitation status
      const { error: invitationError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (invitationError) {
        console.error('⚠️ Error updating invitation:', invitationError);
      }

      toast({
        title: "Succes",
        description: "Te-ai alăturat familiei cu succes",
      });

      // Clear pending invitations and reload family data
      setPendingInvitations([]);
      
      console.log('🔄 Reloading family data after accepting invitation');
      await loadFamilyData();
      
    } catch (error: any) {
      console.error('❌ Error accepting invitation:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut accepta invitația",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      console.log('Declining invitation:', invitationId);
      
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
    createFamily: async () => { throw new Error('Not implemented'); },
    inviteMember: async () => { throw new Error('Not implemented'); },
    acceptInvitation: async () => { throw new Error('Not implemented'); },
    declineInvitation: async () => { throw new Error('Not implemented'); },
    removeMember: async () => { throw new Error('Not implemented'); },
    leaveFamily: async () => { throw new Error('Not implemented'); },
    loading,
    refreshFamily: async () => { await loadFamilyData(); },
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
