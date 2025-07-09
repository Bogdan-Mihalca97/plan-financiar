import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";

interface AddTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionForm = ({ isOpen, onClose }: AddTransactionFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii conectat pentru a adăuga o tranzacție",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await addTransaction({
        user_id: user.id,
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        family_group_id: currentFamily?.id || null
      });

      toast({
        title: "Tranzacție Adăugată!",
        description: `${formData.type === 'income' ? 'Venit' : 'Cheltuială'} de ${formData.amount} Lei a fost adăugată.`,
      });
      
      onClose();
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: "",
        type: "expense",
        category: ""
      });
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Eroare la adăugarea tranzacției",
        description: error.message || "A apărut o problemă la salvarea tranzacției",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Alimentare",
    "Transport", 
    "Utilități",
    "Divertisment",
    "Sănătate",
    "Îmbrăcăminte",
    "Educație",
    "Sport",
    "Călătorii",
    "Cadouri",
    "Altele"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Adaugă Tranzacție Nouă
          </DialogTitle>
          <DialogDescription>
            Înregistrează o nouă tranzacție în lista ta
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              placeholder="ex. Cafea de dimineață"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Suma (Lei)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Tip</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as "income" | "expense" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează tipul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Venit</SelectItem>
                <SelectItem value="expense">Cheltuială</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Se salvează..." : "Adaugă Tranzacția"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionForm;
