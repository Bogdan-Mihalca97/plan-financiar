
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Plus } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";

const InviteMemberForm = () => {
  const { inviteMember, isCreator } = useFamily();
  const { toast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    if (!isValidEmail(inviteEmail.trim())) {
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci o adresă de email validă",
        variant: "destructive",
      });
      return;
    }
    
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim().toLowerCase());
      setInviteEmail("");
      toast({
        title: "Succes",
        description: "Invitația a fost creată cu succes! (Email dezactivat pentru testare)",
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

  if (!isCreator) {
    return null;
  }

  return (
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
              maxLength={100}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isInviting || !inviteEmail.trim() || !isValidEmail(inviteEmail.trim())}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isInviting ? "Se trimite..." : "Trimite Invitația"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteMemberForm;
