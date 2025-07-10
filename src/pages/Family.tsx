import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CreateFamilyForm from "@/components/family/CreateFamilyForm";
import FamilyMembersList from "@/components/family/FamilyMembersList";
import InviteMemberForm from "@/components/family/InviteMemberForm";
import PendingInvitationsCard from "@/components/family/PendingInvitationsCard";
import ExportFamilyPDF from "@/components/family/ExportFamilyPDF";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut, Users, Target, DollarSign } from "lucide-react";

const Family = () => {
  const { 
    currentFamily, 
    familyInvitations,
    pendingInvitations,
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
        {/* Show pending invitations first */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <PendingInvitationsCard />
          </div>
        )}

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
                    {isCreator ? "Administrator" : "Membru"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ExportFamilyPDF />
                  {isCreator && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Settings className="h-3 w-3 mr-1" />
                      Administrator
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

            {/* Family shared data info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Date Partajate Familie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Tranzacții Familie</h3>
                      <p className="text-sm text-blue-700">Vezi toate tranzacțiile familiei în secțiunea Tranzacții</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-900">Bugete Comune</h3>
                      <p className="text-sm text-green-700">Accesează bugetele partajate în secțiunea Bugete</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-purple-900">Obiective Familie</h3>
                      <p className="text-sm text-purple-700">Vezi obiectivele comune în secțiunea Obiective</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Cum să vezi datele familiei:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Mergi la <strong>Tranzacții</strong> - vei vedea toate tranzacțiile tale și ale familiei</li>
                    <li>• Mergi la <strong>Bugete</strong> - vei putea gestiona bugetele personale și de familie</li>
                    <li>• Mergi la <strong>Obiective</strong> - vei vedea obiectivele tale și cele comune</li>
                    <li>• Toate datele familiei sunt marcate special pentru identificare ușoară</li>
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
