
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyGroup, FamilyMember, FamilyInvitation } from '@/types/family';

export const useFamilyData = (
  setCurrentFamily: (family: FamilyGroup | null) => void,
  setFamilyMembers: (members: FamilyMember[]) => void,
  setFamilyInvitations: (invitations: FamilyInvitation[]) => void,
  setPendingInvitations: (invitations: FamilyInvitation[]) => void,
  setIsCreator: (isCreator: boolean) => void,
  setLoading: (loading: boolean) => void
) => {
  const { user, userProfile } = useAuth();

  const loadFamilyData = useCallback(async () => {
    if (!user || !userProfile) {
      console.log('❌ No user or userProfile available');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading family data for user:', user.id);

      // Check if user is a member of any family
      const { data: membership, error: membershipError } = await supabase
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
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('❌ Error fetching membership:', membershipError);
        throw membershipError;
      }

      if (membership && membership.family_groups) {
        console.log('✅ User is member of family:', membership.family_groups);
        const familyGroup = membership.family_groups as FamilyGroup;
        setCurrentFamily(familyGroup);
        setIsCreator(familyGroup.created_by === user.id);

        // Load family members
        const { data: membersData, error: membersError } = await supabase
          .from('family_memberships')
          .select(`
            user_id,
            role,
            joined_at,
            profiles (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq('family_group_id', familyGroup.id);

        if (membersError) {
          console.error('❌ Error fetching family members:', membersError);
          throw membersError;
        }

        const formattedMembers: FamilyMember[] = (membersData || []).map(member => ({
          id: member.user_id,
          user_id: member.user_id,
          family_group_id: familyGroup.id,
          role: member.role,
          joined_at: member.joined_at,
          first_name: member.profiles?.first_name || '',
          last_name: member.profiles?.last_name || '',
          email: member.profiles?.email || ''
        }));

        setFamilyMembers(formattedMembers);

        // Load family invitations (sent by this family)
        if (familyGroup.created_by === user.id) {
          const { data: invitationsData, error: invitationsError } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('family_group_id', familyGroup.id)
            .eq('status', 'pending');

          if (invitationsError) {
            console.error('❌ Error fetching family invitations:', invitationsError);
          } else {
            setFamilyInvitations(invitationsData || []);
          }
        }
      } else {
        console.log('ℹ️ User is not a member of any family');
        setCurrentFamily(null);
        setFamilyMembers([]);
        setFamilyInvitations([]);
        setIsCreator(false);
      }

      // Always check for pending invitations for this user
      const { data: pendingData, error: pendingError } = await supabase
        .from('family_invitations')
        .select(`
          id,
          email,
          created_at,
          expires_at,
          family_group_id,
          invited_by,
          family_groups (
            name
          ),
          profiles!family_invitations_invited_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (pendingError) {
        console.error('❌ Error fetching pending invitations:', pendingError);
      } else {
        console.log('🔍 Pending invitations found:', pendingData);
        const formattedPendingInvitations: FamilyInvitation[] = (pendingData || []).map(invitation => ({
          id: invitation.id,
          email: invitation.email,
          family_group_id: invitation.family_group_id,
          invited_by: invitation.invited_by,
          status: 'pending',
          created_at: invitation.created_at,
          expires_at: invitation.expires_at,
          family_name: invitation.family_groups?.name || 'Familie necunoscută',
          inviter_name: invitation.profiles 
            ? `${invitation.profiles.first_name || ''} ${invitation.profiles.last_name || ''}`.trim()
            : 'Utilizator necunoscut'
        }));

        setPendingInvitations(formattedPendingInvitations);
      }

    } catch (error: any) {
      console.error('❌ Error in loadFamilyData:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, setCurrentFamily, setFamilyMembers, setFamilyInvitations, setPendingInvitations, setIsCreator, setLoading]);

  return { loadFamilyData };
};
