
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/contexts/TransactionsContext";
import type { Transaction } from "@/types/transaction";

interface EditTransactionFormProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditTransactionForm = ({ transaction, isOpen, onClose }: EditTransactionFormProps) => {
  const { updateTransaction } = useTransactions();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: ""
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category
      });
      setErrors({});
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validare dată
    if (!formData.date) {
      newErrors.date = "Data este obligatorie";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (selectedDate > today) {
        newErrors.date = "Data nu poate fi în viitor";
      } else if (selectedDate < oneYearAgo) {
        newErrors.date = "Data nu poate fi mai veche de un an";
      }
    }

    // Validare descriere
    if (!formData.description.trim()) {
      newErrors.description = "Descrierea este obligatorie";
    } else if (formData.description.trim().length < 3) {
      newErrors.description = "Descrierea trebuie să aibă cel puțin 3 caractere";
    } else if (formData.description.trim().length > 200) {
      newErrors.description = "Descrierea nu poate avea mai mult de 200 de caractere";
    }

    // Validare sumă
    if (!formData.amount) {
      newErrors.amount = "Suma este obligatorie";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Suma trebuie să fie un număr valid";
      } else if (amount <= 0) {
        newErrors.amount = "Suma trebuie să fie mai mare decât 0";
      } else if (amount > 1000000) {
        newErrors.amount = "Suma nu poate fi mai mare de 1.000.000 Lei";
      } else if (formData.amount.includes('.') && formData.amount.split('.')[1].length > 2) {
        newErrors.amount = "Suma poate avea maximum 2 zecimale";
      }
    }

    // Validare categorie
    if (!formData.category) {
      newErrors.category = "Categoria este obligatorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;

    if (!validateForm()) {
      toast({
        title: "Eroare de validare",
        description: "Te rog corectează erorile din formular",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      await updateTransaction(transaction.id, {
        date: formData.date,
        description: formData.description.trim(),
        amount: amount,
        type: formData.type,
        category: formData.category
      });

      toast({
        title: "Tranzacție actualizată",
        description: "Tranzacția a fost actualizată cu succes.",
      });

      onClose();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Eroare la actualizarea tranzacției",
        description: error.message || "A apărut o problemă la actualizarea tranzacției",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  const incomeCategories = [
    "Salariu",
    "Freelance",
    "Investiții",
    "Bonusuri",
    "Vânzări",
    "Altele"
  ];

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editează Tranzacția</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
              required
              disabled={isLoading}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere *</Label>
            <Textarea
              id="description"
              placeholder="Ex: Cumpărături la supermarket"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              required
              disabled={isLoading}
              maxLength={200}
              rows={3}
            />
            <div className="flex justify-between">
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              <p className="text-xs text-gray-500 ml-auto">{formData.description.length}/200</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Suma (Lei) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="1000000"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
              required
              disabled={isLoading}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipul tranzacției *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: "income" | "expense") => {
                handleInputChange('type', value);
                // Reset category when type changes
                setFormData(prev => ({ ...prev, type: value, category: "" }));
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Cheltuială</SelectItem>
                <SelectItem value="income">Venit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                {(formData.type === 'income' ? incomeCategories : categories).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Anulează
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Se actualizează..." : "Actualizează Tranzacția"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionForm;
