
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, userProfile, isAuthenticated, loading, updateProfile, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: userProfile?.first_name || '',
    lastName: userProfile?.last_name || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleSaveProfile = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      toast({
        title: "Eroare",
        description: "Numele și prenumele sunt obligatorii",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile(editData.firstName, editData.lastName);
      setIsEditing(false);
      toast({
        title: "Profil actualizat",
        description: "Datele tale au fost actualizate cu succes",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza profilul",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge contul",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profilul meu</h1>
            <p className="mt-2 text-gray-600">Gestionează-ți informațiile de cont</p>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informații personale</CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editează
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prenume</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      placeholder="Prenumele tău"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userProfile?.first_name || 'Nu este specificat'}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nume</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      placeholder="Numele tău"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userProfile?.last_name || 'Nu este specificat'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-500">Emailul nu poate fi modificat</p>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Se salvează...' : 'Salvează'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anulează
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona de risc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Șterge contul</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Odată ce îți ștergi contul, nu mai poți reveni. Te rugăm să fii sigur.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Șterge contul
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Această acțiune nu poate fi anulată. Aceasta va șterge permanent contul tău
                        și va elimina toate datele tale de pe serverele noastre, inclusiv:
                        <br />
                        <br />
                        • Toate tranzacțiile tale
                        <br />
                        • Bugetele și obiectivele
                        <br />
                        • Investițiile
                        <br />
                        • Apartenența la familii
                        <br />
                        • Toate celelalte date personale
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Se șterge...' : 'Da, șterge contul'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
