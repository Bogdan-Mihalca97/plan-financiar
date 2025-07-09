
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";

const PendingInvitationsCard = () => {
  const { pendingInvitations, acceptInvitation, declineInvitation } = useFamily();

  if (pendingInvitations.length === 0) {
    return null;
  }

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
          {pendingInvitations.map((invitation) => (
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
                </div>
                <Badge variant="outline" className="ml-2">
                  În așteptare
                </Badge>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => acceptInvitation(invitation.id)}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Acceptă
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineInvitation(invitation.id)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Refuză
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitationsCard;
