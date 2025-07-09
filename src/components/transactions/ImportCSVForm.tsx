import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { Transaction } from "@/types/transaction";

interface ImportCSVFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const ImportCSVForm = ({ isOpen, onClose }: ImportCSVFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const parseCSV = (csvText: string): ParsedTransaction[] => {
    const lines = csvText.split('\n');
    const headers = lines[0]?.split(',') || [];
    const transactions: ParsedTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i]?.split(',') || [];
      if (data.length !== headers.length) continue;

      const transaction: Partial<ParsedTransaction> = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]?.trim().toLowerCase();
        const value = data[j]?.trim();

        if (header === 'date') {
          transaction.date = value;
        } else if (header === 'description') {
          transaction.description = value;
        } else if (header === 'amount') {
          transaction.amount = parseFloat(value);
        } else if (header === 'type') {
          if (value.toLowerCase() === 'income' || value.toLowerCase() === 'venit') {
            transaction.type = 'income';
          } else if (value.toLowerCase() === 'expense' || value.toLowerCase() === 'cheltuiala') {
            transaction.type = 'expense';
          }
        } else if (header === 'category') {
          transaction.category = value;
        }
      }

      if (transaction.date && transaction.description && transaction.amount && transaction.type && transaction.category) {
        transactions.push(transaction as ParsedTransaction);
      }
    }

    return transactions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !user) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un fișier CSV.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const csvText = await file.text();
      const parsedTransactions = parseCSV(csvText);

      if (parsedTransactions.length === 0) {
        throw new Error("Nu s-au găsit tranzacții valide în fișier");
      }

      // Convert parsed transactions to full Transaction objects
      const transactionsToInsert = parsedTransactions.map((parsed): Omit<Transaction, 'id'> => ({
        user_id: user.id,
        date: parsed.date,
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        family_group_id: currentFamily?.id || null
      }));

      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

      if (error) throw error;

      toast({
        title: "Import Reușit!",
        description: `${parsedTransactions.length} tranzacții au fost importate.`,
      });
      
      onClose();
      setFile(null);
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Eroare la import",
        description: error.message || "A apărut o problemă la importul fișierului",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importă Tranzacții din CSV</DialogTitle>
          <DialogDescription>
            Încarcă un fișier CSV cu tranzacțiile tale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Fișier CSV</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Se Importă..." : "Importă"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSVForm;
