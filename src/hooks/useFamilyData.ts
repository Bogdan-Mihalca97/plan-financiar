
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyGroup, FamilyMember, FamilyInvitation } from '@/types/family';
import { cleanupOrphanedMembership, enrichMemberWithProfile, enrichInvitationWithDetails } from '@/utils/familyUtils';

export const useFamilyData = (
  setCurrentFamily: React.Dispatch<React.SetStateAction<FamilyGroup | null>>,
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>,
  setFamilyInvitations: React.Dispatch<React.SetStateAction<FamilyInvitation[]>>,
  setPendingInvitations: React.Dispatch<React.SetStateAction<FamilyInvitation[]>>,
  setIsCreator: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const { user, isAuthenticated, userProfile } = useAuth();
  const loadingRef = useRef(false);
  const hasShownFamilyFoundToast = useRef(false);

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
          const enriched = await enrichInvitationWithDetails(invitation);
          enrichedInvitations.push(enriched);
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

  const loadFamilyMembers = async (familyGroupId: string) => {
    console.log('🔍 Loading all family members for group:', familyGroupId);
    
    // Load all family members for this group
    const { data: allMemberships, error: membersError } = await supabase
      .from('family_memberships')
      .select('*')
      .eq('family_group_id', familyGroupId);

    console.log('🔍 All memberships query result:', { allMemberships, membersError });

    if (membersError) {
      console.error('❌ Error loading family members:', membersError);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca membrii familiei",
        variant: "destructive",
      });
      return [];
    }

    if (!allMemberships || allMemberships.length === 0) {
      console.log('⚠️ No family members found');
      return [];
    }

    // Get user profiles for each member
    const memberProfiles: FamilyMember[] = [];
    for (const member of allMemberships) {
      try {
        const enrichedMember = await enrichMemberWithProfile(member);
        memberProfiles.push(enrichedMember);
        console.log('✅ Enriched member:', enrichedMember);
      } catch (error) {
        console.error('❌ Error enriching member:', member.id, error);
        // Still add the member even if profile enrichment fails
        memberProfiles.push({
          ...member,
          is_creator: member.role === 'admin',
        });
      }
    }
    
    console.log('✅ All member profiles loaded:', memberProfiles);
    return memberProfiles;
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

        // Get the family group details
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

        // Load all family members
        const memberProfiles = await loadFamilyMembers(familyGroup.id);
        setFamilyMembers(memberProfiles);

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

        // Show success message only once when the user is first found to be part of the family
        if (!hasShownFamilyFoundToast.current) {
          hasShownFamilyFoundToast.current = true;
          toast({
            title: "Familie găsită",
            description: `Faci parte din familia "${familyGroup.name}". Acum poți vedea datele partajate ale familiei.`,
          });
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

  return { loadFamilyData };
};
