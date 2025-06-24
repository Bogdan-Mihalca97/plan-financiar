
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Plus, Users, Mail, Crown, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Family = () => {
  const { userProfile, logout } = useAuth();
  const { 
    currentFamily, 
    familyMembers, 
    pendingInvitations, 
    userFamilies,
    createFamilyGroup, 
    inviteFamilyMember,
    switchFamily,
    loading 
  } = useFamily();
  const { toast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    setIsCreating(true);
    try {
      await createFamilyGroup(newFamilyName);
      toast({
        title: "Familie creată!",
        description: `Familia "${newFamilyName}" a fost creată cu succes.`,
      });
      setNewFamilyName("");
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut crea familia.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteFamilyMember(inviteEmail);
      toast({
        title: "Invitație trimisă!",
        description: `Invitația a fost trimisă la ${inviteEmail}.`,
      });
      setInviteEmail("");
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut trimite invitația.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă datele familiei...</p>
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
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <PiggyBank className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
              </Link>
              <nav className="hidden lg:flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Buget
                </Link>
                <Link to="/goals" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/family" className="text-indigo-600 font-medium">
                  Familie
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bună, {userProfile?.first_name || 'Utilizator'}!</span>
              <Button variant="outline" onClick={logout}>
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Familie</h2>
            <p className="text-gray-600">Gestionează familia și membrii</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Creează Familie
          </Button>
        </div>

        {/* Family Selector */}
        {userFamilies.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Selectează Familia</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currentFamily?.id || ""} onValueChange={switchFamily}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Selectează o familie" />
                </SelectTrigger>
                <SelectContent>
                  {userFamilies.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Create Family Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Creează Familie Nouă</CardTitle>
              <CardDescription>
                Introdu numele familiei pentru a crea un grup nou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Numele Familiei</Label>
                  <Input
                    id="familyName"
                    placeholder="Familia Popescu"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Se creează..." : "Creează Familie"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Anulează
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentFamily ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Family Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {currentFamily.name}
                </CardTitle>
                <CardDescription>
                  Membrii familiei și rolurile lor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {member.role === 'admin' ? (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{member.profile?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role === 'admin' ? 'Administrator' : 'Membru'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Invite Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invită Membri
                </CardTitle>
                <CardDescription>
                  Invită persoane să se alăture familiei
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Adresa de Email</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="exemplu@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isInviting} className="w-full">
                    {isInviting ? "Se trimite..." : "Trimite Invitația"}
                  </Button>
                </form>

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Invitații în așteptare</h4>
                    <div className="space-y-2">
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm">{invitation.email}</span>
                          <span className="text-xs text-yellow-600">În așteptare</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nu faci parte dintr-o familie încă
              </h3>
              <p className="text-gray-500 mb-6">
                Creează o familie nouă pentru a începe să partajezi bugetul cu familia ta
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Creează Prima Familie
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Family;
