import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Users, Mail } from "lucide-react";

interface FamilyInvitation {
  id: string;
  email: string;
  family_group_id: string;
  invited_by: string;
  status: string;
  created_at: string;
  expires_at: string;
  family_groups: {
    name: string;
    created_by: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const InvitationAcceptance = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          family_groups (name, created_by)
        `)
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (error) {
        console.error('Error loading invitation:', error);
        toast({
          title: "Eroare",
          description: "Invitația nu a fost găsită sau a expirat",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check if invitation is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        toast({
          title: "Invitația a expirat",
          description: "Această invitație nu mai este validă",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Get the inviter's profile separately
      const { data: inviterProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.invited_by)
        .single();

      if (profileError) {
        console.error('Error loading inviter profile:', profileError);
      }

      const invitationData = {
        ...data,
        profiles: inviterProfile || { first_name: 'Un utilizator', last_name: '' }
      };

      setInvitation(invitationData);
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la încărcarea invitației",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;

    // Check if user email matches invitation email
    if (user.email !== invitation.email) {
      toast({
        title: "Email incorect",
        description: `Această invitație este pentru ${invitation.email}. Te rugăm să te conectezi cu emailul corect.`,
        variant: "destructive",
      });
      return;
    }

    setAccepting(true);
    try {
      // Check if user is already a member of this family
      const { data: existingMembership } = await supabase
        .from('family_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('family_group_id', invitation.family_group_id)
        .maybeSingle();

      if (existingMembership) {
        toast({
          title: "Deja membru",
          description: "Ești deja membru al acestei familii",
        });
        
        // Set a flag to prevent auth redirect and go directly to family page
        localStorage.setItem('skipAuthRedirect', 'true');
        setTimeout(() => {
          navigate('/family');
        }, 500);
        return;
      }

      // Create family membership
      const { error: membershipError } = await supabase
        .from('family_memberships')
        .insert({
          family_group_id: invitation.family_group_id,
          user_id: user.id,
          role: 'member'
        });

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
        throw membershipError;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        // Don't throw here as the membership was created successfully
      }

      toast({
        title: "Succes!",
        description: `Te-ai alăturat cu succes familiei ${invitation.family_groups.name}`,
      });

      // Set a flag to prevent auth redirect and go directly to family page
      localStorage.setItem('skipAuthRedirect', 'true');
      setTimeout(() => {
        navigate('/family');
      }, 500);
      
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la acceptarea invitației",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthRedirect = () => {
    // Store invitation ID in localStorage to return after auth
    if (invitationId) {
      localStorage.setItem('pendingInvitation', invitationId);
    }
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă invitația...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Invitația nu a fost găsită.</p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="mt-4"
            >
              Înapoi la autentificare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Invitație în Familie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">
              Ai fost invitat să te alături familiei
            </p>
            <p className="text-lg font-semibold mt-1">
              {invitation.family_groups.name}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Invitat de {invitation.profiles.first_name} {invitation.profiles.last_name}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Pentru a accepta invitația:
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      1. Conectează-te sau creează cont cu emailul: <strong>{invitation.email}</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      2. Verifică-ți emailul dacă este un cont nou
                    </p>
                    <p className="text-sm text-blue-700">
                      3. Revino la acest link pentru a accepta invitația
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleAuthRedirect}
                className="w-full"
              >
                Conectează-te / Creează cont
              </Button>
            </div>
          ) : user?.email !== invitation.email ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600 text-center">
                Ești conectat cu {user?.email}, dar invitația este pentru {invitation.email}.
              </p>
              <Button 
                onClick={handleAuthRedirect}
                variant="outline"
                className="w-full"
              >
                Conectează-te cu emailul corect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600 text-center">
                Conectat ca {user.email} ✓
              </p>
              <Button 
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Se acceptă...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Acceptă Invitația
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Invitația va expira la {new Date(invitation.expires_at).toLocaleDateString('ro-RO')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAcceptance;
