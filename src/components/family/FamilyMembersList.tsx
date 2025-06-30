
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";

const FamilyMembersList = () => {
  const { familyMembers, isCreator, removeMember } = useFamily();

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm("Ești sigur că vrei să elimini acest membru din familie?")) {
      await removeMember(memberId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Membri Familie ({familyMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {familyMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nu există membri în această familie încă.
            </p>
          ) : (
            familyMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {member.first_name && member.last_name 
                      ? `${member.first_name} ${member.last_name}`
                      : member.email || 'Nume necunoscut'}
                  </div>
                  {member.email && (
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role === 'admin' ? 'Administrator' : 'Membru'}
                  </Badge>
                  {isCreator && member.role !== 'admin' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Elimină
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMembersList;
