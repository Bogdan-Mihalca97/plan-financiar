
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddBudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddBudgetForm = ({ isOpen, onClose }: AddBudgetFormProps) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulăm salvarea bugetului
    setTimeout(() => {
      toast({
        title: "Buget Adăugat!",
        description: `Buget de ${limit} Lei pentru ${category} a fost creat.`,
      });
      setIsLoading(false);
      onClose();
      // Reset form
      setCategory("");
      setLimit("");
      setPeriod("monthly");
    }, 1000);
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
          <DialogTitle>Adaugă Buget Nou</DialogTitle>
          <DialogDescription>
            Creează un buget pentru o categorie de cheltuieli
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
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
          
          <div className="space-y-2">
            <Label htmlFor="limit">Limita Bugetului (Lei)</Label>
            <Input
              id="limit"
              type="number"
              placeholder="0.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Perioada</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as "monthly" | "yearly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Lunar</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Se salvează..." : "Creează Buget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetForm;
