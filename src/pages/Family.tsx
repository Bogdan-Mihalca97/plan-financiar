
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, UserPlus, Settings, LogOut, AlertCircle } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  
  const [newFamilyName, setNewFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    
    if (!newFamilyName.trim()) {
      setCreateError("Te rugăm să introduci numele familiei");
      return;
    }
    
    if (!user) {
      setCreateError("Nu ești autentificat");
      return;
    }
    
    setIsCreating(true);
    try {
      console.log('Starting family creation with name:', newFamilyName, 'for user:', user.id);
      await createFamily(newFamilyName.trim());
      setNewFamilyName("");
      setCreateError(null);
      toast({
        title: "Succes",
        description: "Familia a fost creată cu succes!",
      });
    } catch (error: any) {
      console.error('Error creating family:', error);
      const errorMessage = error.message || "A apărut o eroare la crearea familiei";
      setCreateError(errorMessage);
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci o adresă de email",
        variant: "destructive",
      });
      return;
    }
    
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail);
      setInviteEmail("");
      toast({
        title: "Succes",
        description: "Invitația a fost trimisă cu succes!",
      });
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la trimiterea invitației",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

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
                {createError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  <div>
                    <Label htmlFor="familyName">Numele Familiei</Label>
                    <Input
                      id="familyName"
                      type="text"
                      placeholder="ex: Familia Popescu"
                      value={newFamilyName}
                      onChange={(e) => {
                        setNewFamilyName(e.target.value);
                        setCreateError(null); // Clear error when user starts typing
                      }}
                      required
                      disabled={isCreating}
                      className={createError ? "border-red-500" : ""}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Se creează..." : "Creează Familia"}
                  </Button>
                </form>
                
                {user && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Conectat ca: {user.email}
                    </p>
                  </div>
                )}
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
                            disabled={isInviting}
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
