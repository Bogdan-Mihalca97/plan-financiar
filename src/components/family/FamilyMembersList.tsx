
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Trash2, Crown, Shield } from "lucide-react";
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

  // Sort members to show admin first
  const sortedMembers = [...familyMembers].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return 0;
  });

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
              sortedMembers.map((member) => (
                <div key={member.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  member.role === 'admin' 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">
                        {getMemberDisplayName(member)}
                      </div>
                      {member.role === 'admin' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              <Crown className="h-3 w-3" />
                              <span>Administrator Familie</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Administrator principal al familiei</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {member.email && (
                      <div className="text-sm text-gray-500 mt-1">
                        {member.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-gray-400">
                        Alăturat la {new Date(member.joined_at).toLocaleDateString('ro-RO')}
                      </div>
                      {member.role === 'admin' && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Shield className="h-3 w-3" />
                          <span>Acces complet</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={member.role === 'admin' ? 'default' : 'secondary'}
                      className={member.role === 'admin' ? 'bg-blue-600 text-white border-blue-600' : ''}
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
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Roluri și permisiuni în familie:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <strong>Administrator:</strong> Poate invita și elimina membri, are acces complet
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <strong>Membru:</strong> Poate vedea și gestiona datele financiare partajate
                </li>
                <li>• Toți membrii pot părăsi familia în orice moment</li>
                <li>• Administratorul este afișat primul în listă cu marcaj special</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default FamilyMembersList;
