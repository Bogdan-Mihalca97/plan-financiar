
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Trash2, Crown } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";

const FamilyMembersList = () => {
  const { familyMembers, isCreator, removeMember } = useFamily();

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm("Ești sigur că vrei să elimini acest membru din familie?")) {
      try {
        await removeMember(memberId);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const getMemberDisplayName = (member: any) => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    if (member.first_name) {
      return member.first_name;
    }
    if (member.last_name) {
      return member.last_name;
    }
    if (member.email) {
      return member.email;
    }
    return 'Nume necunoscut';
  };

  console.log('🔍 Rendering FamilyMembersList with members:', familyMembers);

  return (
    <TooltipProvider>
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
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  Nu există membri în această familie încă.
                </p>
                <p className="text-gray-400 text-sm">
                  Invită membri pentru a împărți datele financiare.
                </p>
              </div>
            ) : (
              familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">
                        {getMemberDisplayName(member)}
                      </div>
                      {member.role === 'admin' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Crown className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Administrator</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {member.email && (
                      <div className="text-sm text-gray-500 mt-1">
                        {member.email}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Alăturat la {new Date(member.joined_at).toLocaleDateString('ro-RO')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={member.role === 'admin' ? 'default' : 'secondary'}
                      className={member.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}
                    >
                      {member.role === 'admin' ? 'Administrator' : 'Membru'}
                    </Badge>
                    {isCreator && member.role !== 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Elimină
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {familyMembers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informații despre membri:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Administratorii pot invita și elimina membri</li>
                <li>• Toți membrii pot vedea datele financiare partajate</li>
                <li>• Membrii pot părăsi familia în orice moment</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default FamilyMembersList;
