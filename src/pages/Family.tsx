
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CreateFamilyForm from "@/components/family/CreateFamilyForm";
import FamilyMembersList from "@/components/family/FamilyMembersList";
import InviteMemberForm from "@/components/family/InviteMemberForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut } from "lucide-react";

const Family = () => {
  const { 
    currentFamily, 
    familyInvitations,
    isCreator,
    leaveFamily,
    loading
  } = useFamily();
  
  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleLeaveFamily = async () => {
    if (window.confirm("Ești sigur că vrei să părăsești familia? Această acțiune nu poate fi anulată.")) {
      await leaveFamily();
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
          <CreateFamilyForm />
        ) : (
          <div className="space-y-8">
            {/* Family Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentFamily.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {isCreator ? " Creator" : " Membru"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isCreator && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Settings className="h-3 w-3 mr-1" />
                      Creator
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLeaveFamily}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Părăsește
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FamilyMembersList />

              <div className="space-y-6">
                <InviteMemberForm />

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

            {/* Info about shared features */}
            <Card>
              <CardHeader>
                <CardTitle>Funcții Familie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600">
                  <p className="mb-2">
                    Ca membru al acestei familii, ai acces la:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bugetele partajate ale familiei</li>
                    <li>Obiectivele financiare comune</li>
                    <li>Tranzacțiile familiei</li>
                    <li>Rapoartele financiare comune</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Family;
