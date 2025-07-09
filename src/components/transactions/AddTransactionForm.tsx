
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useAuth } from "@/contexts/AuthContext";

interface AddTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionForm = ({ isOpen, onClose }: AddTransactionFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a adăuga tranzacții.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await addTransaction({
        user_id: user.id,
        date,
        description,
        amount: parseFloat(amount),
        type,
        category
      });

      toast({
        title: "Tranzacție Adăugată!",
        description: `${type === "income" ? "Venit" : "Cheltuială"} de ${amount} Lei a fost adăugată.`,
      });

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut adăuga tranzacția.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const expenseCategories = [
    "Alimentare",
    "Transport",
    "Utilități", 
    "Divertisment",
    "Sănătate",
    "Îmbrăcăminte",
    "Altele"
  ];

  const incomeCategories = [
    "Salariu",
    "Freelancing",
    "Investiții",
    "Cadouri",
    "Altele"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Tranzacție Nouă</DialogTitle>
          <DialogDescription>
            Completează detaliile tranzacției tale
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={type} onValueChange={(value) => setType(value as "income" | "expense")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Cheltuială</TabsTrigger>
            <TabsTrigger value="income">Venit</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Input
                id="description"
                placeholder="Descrierea tranzacției"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Se salvează..." : `Adaugă ${type === "income" ? "Venit" : "Cheltuială"}`}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionForm;
