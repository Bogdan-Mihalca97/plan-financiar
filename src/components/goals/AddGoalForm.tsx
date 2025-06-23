
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddGoalForm = ({ isOpen, onClose }: AddGoalFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
    priority: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii conectat pentru a crea un obiectiv",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            target_amount: parseFloat(formData.targetAmount),
            current_amount: parseFloat(formData.currentAmount) || 0,
            deadline: formData.deadline,
            category: formData.category || null,
            priority: formData.priority || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Obiectiv Creat!",
        description: `Obiectivul "${formData.title}" a fost creat cu succes.`,
      });
      
      onClose();
      // Reset form
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        category: "",
        priority: ""
      });
    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast({
        title: "Eroare la crearea obiectivului",
        description: error.message || "A apărut o problemă la salvarea obiectivului",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Adaugă Obiectiv Nou
          </DialogTitle>
          <DialogDescription>
            Creează un nou obiectiv financiar și urmărește-ți progresul.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titlu Obiectiv</Label>
            <Input
              id="title"
              placeholder="ex. Fond de urgență"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              placeholder="Descrie obiectivul tău..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Suma Țintă (Lei)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="10000"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Suma Actuală (Lei)</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => handleInputChange("currentAmount", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Economii</SelectItem>
                  <SelectItem value="investment">Investiții</SelectItem>
                  <SelectItem value="purchase">Cumpărături</SelectItem>
                  <SelectItem value="debt">Datorii</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritate</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează prioritatea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Prioritate Mare</SelectItem>
                  <SelectItem value="medium">Prioritate Medie</SelectItem>
                  <SelectItem value="low">Prioritate Mică</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Se creează..." : "Creează Obiectivul"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalForm;
