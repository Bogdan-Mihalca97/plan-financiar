
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember, FamilyInvitation } from '@/types/family';

export const cleanupOrphanedMembership = async (membershipId: string) => {
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
    }
  } catch (error) {
    console.error('❌ Error in cleanup:', error);
  }
};

export const enrichMemberWithProfile = async (member: any): Promise<FamilyMember> => {
  try {
    console.log('🔍 Enriching member profile for user_id:', member.user_id);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', member.user_id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Error loading profile for user:', member.user_id, profileError);
    } else {
      console.log('✅ Profile loaded for user:', member.user_id, profile);
    }

    return {
      ...member,
      email: profile?.email || undefined,
      first_name: profile?.first_name || undefined,
      last_name: profile?.last_name || undefined,
      is_creator: member.role === 'admin',
    };
  } catch (error) {
    console.error('❌ Error enriching member profile:', member.user_id, error);
    return {
      ...member,
      is_creator: member.role === 'admin',
    };
  }
};

export const enrichInvitationWithDetails = async (invitation: any): Promise<FamilyInvitation> => {
  try {
    console.log('🔍 Enriching invitation:', invitation.id);
    
    // Get family name
    const { data: family, error: familyError } = await supabase
      .from('family_groups')
      .select('name')
      .eq('id', invitation.family_group_id)
      .maybeSingle();

    if (familyError) {
      console.error('❌ Error loading family for invitation:', familyError);
    } else {
      console.log('🔍 Family for invitation:', family);
    }

    // Get inviter name with better debugging
    const { data: inviterProfile, error: inviterError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', invitation.invited_by)
      .maybeSingle();

    if (inviterError) {
      console.error('❌ Error loading inviter profile:', inviterError);
    } else {
      console.log('🔍 Inviter profile query:', { 
        inviterId: invitation.invited_by, 
        inviterProfile
      });
    }

    const inviterName = inviterProfile 
      ? `${inviterProfile.first_name || ''} ${inviterProfile.last_name || ''}`.trim() || inviterProfile.email || 'Administrator'
      : 'Administrator';

    console.log('🔍 Final inviter name:', inviterName);

    return {
      ...invitation,
      status: invitation.status as 'pending' | 'accepted' | 'declined',
      family_name: family?.name || 'Familie necunoscută',
      inviter_name: inviterName
    };
  } catch (error) {
    console.error('❌ Error enriching invitation:', error);
    return {
      ...invitation,
      status: invitation.status as 'pending' | 'accepted' | 'declined',
      family_name: 'Familie necunoscută',
      inviter_name: 'Administrator'
    };
  }
};
