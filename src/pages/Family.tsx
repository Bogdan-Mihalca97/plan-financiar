
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, UserPlus, Settings, LogOut } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";

const Family = () => {
  const { 
    currentFamily, 
    familyMembers, 
    familyInvitations,
    isAdmin,
    createFamily,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    leaveFamily,
    loading
  } = useFamily();
  
  const { userProfile } = useAuth();
  
  const [newFamilyName, setNewFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    
    setIsCreating(true);
    try {
      await createFamily(newFamilyName);
      setNewFamilyName("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail);
      setInviteEmail("");
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Familie</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bună, {userProfile?.first_name || 'Utilizator'}!</span>
              <Button variant="outline" size="sm">
                Înapoi la Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentFamily ? (
          // No family - show create family form
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Creează o Familie
                </CardTitle>
                <p className="text-gray-600">
                  Începe prin a crea un grup de familie pentru a partaja bugetul și obiectivele financiare.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  <div>
                    <Label htmlFor="familyName">Numele Familiei</Label>
                    <Input
                      id="familyName"
                      type="text"
                      placeholder="ex: Familia Popescu"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Se creează..." : "Creează Familia"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Has family - show family management
          <div className="space-y-8">
            {/* Family Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentFamily.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {familyMembers.length} membri • 
                    {isAdmin ? " Administrator" : " Membru"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Settings className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={leaveFamily}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Părăsește
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Family Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membri Familie ({familyMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}`
                              : member.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role === 'admin' ? 'Admin' : 'Membru'}
                          </Badge>
                          {isAdmin && member.role !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeMember(member.id)}
                            >
                              Elimină
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Invite Members & Pending Invitations */}
              <div className="space-y-6">
                {/* Invite Form */}
                {isAdmin && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Invită Membru Nou
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div>
                          <Label htmlFor="inviteEmail">Email</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="adresa@email.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isInviting}>
                          <Plus className="h-4 w-4 mr-2" />
                          {isInviting ? "Se trimite..." : "Trimite Invitația"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Invitations */}
                {familyInvitations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Invitații în Așteptare ({familyInvitations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {familyInvitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{invitation.email}</div>
                              <div className="text-sm text-gray-500">
                                Trimisă la {new Date(invitation.created_at).toLocaleDateString('ro-RO')}
                              </div>
                            </div>
                            <Badge variant="outline">În așteptare</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Family;
