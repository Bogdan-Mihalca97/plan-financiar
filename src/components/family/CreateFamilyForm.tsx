
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CreateFamilyForm = () => {
  const { createFamily } = useFamily();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    
    if (!newFamilyName.trim()) {
      setCreateError("Te rugăm să introduci numele familiei");
      return;
    }
    
    if (newFamilyName.trim().length < 2) {
      setCreateError("Numele familiei trebuie să aibă cel puțin 2 caractere");
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

  return (
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
                  setCreateError(null);
                }}
                required
                disabled={isCreating}
                maxLength={50}
                className={createError ? "border-red-500" : ""}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating || !newFamilyName.trim()}>
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
  );
};

export default CreateFamilyForm;
