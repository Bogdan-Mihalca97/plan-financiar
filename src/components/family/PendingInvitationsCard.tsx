
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useState } from "react";

const PendingInvitationsCard = () => {
  const { pendingInvitations, acceptInvitation, declineInvitation } = useFamily();
  const [processingInvites, setProcessingInvites] = useState<string[]>([]);

  console.log('🔍 PendingInvitationsCard - pendingInvitations:', {
    count: pendingInvitations.length,
    invitations: pendingInvitations
  });

  if (pendingInvitations.length === 0) {
    console.log('ℹ️ No pending invitations to display');
    return null;
  }

  const handleAccept = async (invitationId: string) => {
    console.log('🔄 Handling accept for invitation:', invitationId);
    setProcessingInvites(prev => [...prev, invitationId]);
    try {
      await acceptInvitation(invitationId);
      console.log('✅ Successfully accepted invitation:', invitationId);
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
    } finally {
      setProcessingInvites(prev => prev.filter(id => id !== invitationId));
    }
  };

  const handleDecline = async (invitationId: string) => {
    console.log('🔄 Handling decline for invitation:', invitationId);
    setProcessingInvites(prev => [...prev, invitationId]);
    try {
      await declineInvitation(invitationId);
      console.log('✅ Successfully declined invitation:', invitationId);
    } catch (error) {
      console.error('❌ Error declining invitation:', error);
    } finally {
      setProcessingInvites(prev => prev.filter(id => id !== invitationId));
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Mail className="h-5 w-5" />
          Invitații de Familie ({pendingInvitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingInvitations.map((invitation) => {
            console.log('🔍 Rendering invitation:', invitation);
            return (
              <div key={invitation.id} className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Invitație la familia "{invitation.family_name}"
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Invitat de: {invitation.inviter_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Trimisă la {new Date(invitation.created_at).toLocaleDateString('ro-RO')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Email: {invitation.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    În așteptare
                  </Badge>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invitation.id)}
                    className="flex-1"
                    disabled={processingInvites.includes(invitation.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {processingInvites.includes(invitation.id) ? 'Se procesează...' : 'Acceptă'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(invitation.id)}
                    className="flex-1"
                    disabled={processingInvites.includes(invitation.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {processingInvites.includes(invitation.id) ? 'Se procesează...' : 'Refuză'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitationsCard;
