
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface AddTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionForm = ({ isOpen, onClose }: AddTransactionFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulăm salvarea tranzacției
    setTimeout(() => {
      toast({
        title: "Tranzacție Adăugată!",
        description: `${type === "income" ? "Venit" : "Cheltuială"} de ${amount} Lei a fost adăugată.`,
      });
      setIsLoading(false);
      onClose();
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
    }, 1000);
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
              <Label htmlFor="amount">Suma (Lei)</Label>
              <Input
                id="amount"
                type="number"
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
