
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyGroup } from '@/types/family';

export const useFamilyActions = (
  currentFamily: FamilyGroup | null,
  isCreator: boolean,
  loadFamilyData: () => Promise<void>,
  setPendingInvitations: React.Dispatch<React.SetStateAction<any[]>>,
  setCurrentFamily: React.Dispatch<React.SetStateAction<FamilyGroup | null>>,
  setFamilyMembers: React.Dispatch<React.SetStateAction<any[]>>,
  setFamilyInvitations: React.Dispatch<React.SetStateAction<any[]>>,
  setIsCreator: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createFamily = async (name: string) => {
    if (!user) {
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

  return {
    createFamily,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    leaveFamily
  };
};
