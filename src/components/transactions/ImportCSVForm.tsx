
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
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
    const transactions: ParsedTransaction[] = [];

    // Support multiple header formats
    const getColumnIndex = (possibleNames: string[]) => {
      return possibleNames.map(name => headers.indexOf(name)).find(index => index !== -1) ?? -1;
    };

    const dateIndex = getColumnIndex(['date', 'data']);
    const descriptionIndex = getColumnIndex(['description', 'descriere']);
    const amountIndex = getColumnIndex(['amount', 'suma']);
    const typeIndex = getColumnIndex(['type', 'tip']);
    const categoryIndex = getColumnIndex(['category', 'categorie']);

    console.log('CSV Headers found:', headers);
    console.log('Column indices:', { dateIndex, descriptionIndex, amountIndex, typeIndex, categoryIndex });

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i]?.split(',').map(cell => cell.trim()) || [];
      if (data.length < Math.max(dateIndex, descriptionIndex, amountIndex) + 1) continue;

      const transaction: Partial<ParsedTransaction> = {};

      // Parse date
      if (dateIndex !== -1 && data[dateIndex]) {
        transaction.date = data[dateIndex];
      }

      // Parse description
      if (descriptionIndex !== -1 && data[descriptionIndex]) {
        transaction.description = data[descriptionIndex];
      }

      // Parse amount
      if (amountIndex !== -1 && data[amountIndex]) {
        const amountStr = data[amountIndex].replace(',', '.');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
          transaction.amount = Math.abs(amount); // Store as positive number
          // Determine type based on original amount sign
          transaction.type = amount >= 0 ? 'income' : 'expense';
        }
      }

      // Parse type (if available, otherwise use amount-based determination)
      if (typeIndex !== -1 && data[typeIndex]) {
        const typeValue = data[typeIndex].toLowerCase();
        if (typeValue === 'income' || typeValue === 'venit') {
          transaction.type = 'income';
        } else if (typeValue === 'expense' || typeValue === 'cheltuiala') {
          transaction.type = 'expense';
        }
      }

      // Parse category (if available, otherwise use default)
      if (categoryIndex !== -1 && data[categoryIndex]) {
        transaction.category = data[categoryIndex];
      } else {
        // Provide default categories based on transaction type
        transaction.category = transaction.type === 'income' ? 'Venit' : 'Cheltuiala';
      }

      // Only add transaction if we have the essential fields
      if (transaction.date && transaction.description && transaction.amount !== undefined && transaction.type && transaction.category) {
        transactions.push(transaction as ParsedTransaction);
      }
    }

    console.log('Parsed transactions:', transactions);
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
        throw new Error("Nu s-au găsit tranzacții valide în fișier. Verifică formatul CSV.");
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
      
      // Refresh the page to show new transactions
      window.location.reload();
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
          <DialogDescription className="space-y-2">
            <div>Încarcă un fișier CSV cu tranzacțiile tale.</div>
            <div className="text-sm">
              <strong>Format acceptat:</strong>
              <br />
              Data,Descriere,Suma,Sold (opțional)
              <br />
              sau
              <br />
              Date,Description,Amount,Type,Category
            </div>
            <div className="text-xs text-muted-foreground">
              Sumele negative vor fi considerate cheltuieli, cele pozitive venituri.
            </div>
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Se Importă..." : "Importă"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSVForm;
