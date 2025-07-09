
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;

    if (!formData.date || !formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile obligatorii.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Eroare",
        description: "Te rog introdu o sumă validă.",
        variant: "destructive",
      });
      return;
    }

    updateTransaction(transaction.id, {
      date: formData.date,
      description: formData.description,
      amount: amount,
      type: formData.type,
      category: formData.category
    });

    toast({
      title: "Tranzacție actualizată",
      description: "Tranzacția a fost actualizată cu succes.",
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

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
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere *</Label>
            <Input
              id="description"
              placeholder="Ex: Cumpărături la supermarket"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Suma (Lei) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipul tranzacției *</Label>
            <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}>
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
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                {formData.type === "expense" ? (
                  <>
                    <SelectItem value="Alimentare">Alimentare</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Utilități">Utilități</SelectItem>
                    <SelectItem value="Divertisment">Divertisment</SelectItem>
                    <SelectItem value="Altele">Altele</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Salariu">Salariu</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investiții">Investiții</SelectItem>
                    <SelectItem value="Altele">Altele</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Anulează
            </Button>
            <Button type="submit" className="flex-1">
              Actualizează Tranzacția
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionForm;
