
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle } from "lucide-react";
import type { Transaction } from "@/pages/Transactions";

interface ImportCSVFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionsImported: (transactions: Omit<Transaction, 'id'>[]) => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const ImportCSVForm = ({ isOpen, onClose, onTransactionsImported }: ImportCSVFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [bankFormat, setBankFormat] = useState<string>("");
  const { toast } = useToast();

  const bankFormats = [
    { id: "bcr", name: "BCR" },
    { id: "brd", name: "BRD" },
    { id: "bt", name: "Banca Transilvania" },
    { id: "ing", name: "ING Bank" },
    { id: "raiffeisen", name: "Raiffeisen Bank" },
    { id: "unicredit", name: "UniCredit Bank" },
    { id: "generic", name: "Format Generic CSV" }
  ];

  const parseCSV = (csvText: string, format: string): ParsedTransaction[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const transactions: ParsedTransaction[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 3) continue;

      let transaction: ParsedTransaction;

      switch (format) {
        case "bcr":
        case "brd":
        case "bt":
          // Format comun: Data, Descriere, Suma, Sold
          transaction = {
            date: columns[0],
            description: columns[1] || "Tranzacție importată",
            amount: Math.abs(parseFloat(columns[2]) || 0),
            type: parseFloat(columns[2]) > 0 ? "income" : "expense",
            category: categorizeTransaction(columns[1] || "")
          };
          break;
        
        case "generic":
        default:
          // Format generic: presupunem Data, Descriere, Suma
          transaction = {
            date: columns[0],
            description: columns[1] || "Tranzacție importată",
            amount: Math.abs(parseFloat(columns[2]) || 0),
            type: parseFloat(columns[2]) > 0 ? "income" : "expense",
            category: categorizeTransaction(columns[1] || "")
          };
          break;
      }

      if (transaction.amount > 0) {
        transactions.push(transaction);
      }
    }

    return transactions;
  };

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes("alimentar") || desc.includes("kaufland") || desc.includes("carrefour") || desc.includes("lidl")) {
      return "Alimentare";
    }
    if (desc.includes("benzin") || desc.includes("rompetrol") || desc.includes("petrom") || desc.includes("transport")) {
      return "Transport";
    }
    if (desc.includes("enel") || desc.includes("engie") || desc.includes("digi") || desc.includes("orange")) {
      return "Utilități";
    }
    if (desc.includes("salariu") || desc.includes("salary")) {
      return "Salariu";
    }
    if (desc.includes("cinema") || desc.includes("restaurant") || desc.includes("entertainment")) {
      return "Divertisment";
    }
    
    return "Altele";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Fișier invalid",
        description: "Te rog să alegi un fișier CSV valid.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!file || !bankFormat) {
      toast({
        title: "Date incomplete",
        description: "Te rog să alegi un fișier și să selectezi formatul băncii.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const transactions = parseCSV(text, bankFormat);
      setParsedTransactions(transactions);
      
      if (transactions.length > 0) {
        toast({
          title: "Import reușit!",
          description: `Au fost importate ${transactions.length} tranzacții.`
        });
      } else {
        toast({
          title: "Nicio tranzacție găsită",
          description: "Fișierul nu conține tranzacții valide.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Eroare la import",
        description: "Nu s-a putut citi fișierul CSV.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // Actually pass the transactions to the parent component
    onTransactionsImported(parsedTransactions);
    
    toast({
      title: "Tranzacții salvate!",
      description: `${parsedTransactions.length} tranzacții au fost adăugate în cont.`
    });
    
    // Reset form
    setFile(null);
    setParsedTransactions([]);
    setBankFormat("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importă Tranzacții din CSV</DialogTitle>
          <DialogDescription>
            Încarcă un fișier CSV cu tranzacțiile tale bancare pentru a le adăuga automat în aplicație.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bank Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="bankFormat">Selectează banca</Label>
            <Select value={bankFormat} onValueChange={setBankFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Alege formatul băncii tale" />
              </SelectTrigger>
              <SelectContent>
                {bankFormats.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Fișier CSV</Label>
            <div className="flex items-center gap-4">
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button 
                onClick={handleImport} 
                disabled={!file || !bankFormat || isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? "Procesez..." : "Analizează"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {parsedTransactions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  {parsedTransactions.length} tranzacții găsite
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  {parsedTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-gray-500">{transaction.date} • {transaction.category}</div>
                      </div>
                      <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount} Lei
                      </div>
                    </div>
                  ))}
                  {parsedTransactions.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... și încă {parsedTransactions.length - 5} tranzacții
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Salvează Tranzacțiile
                </Button>
                <Button variant="outline" onClick={() => setParsedTransactions([])}>
                  Anulează
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instrucțiuni:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Descarcă fișierul CSV cu tranzacțiile din aplicația băncii tale</li>
              <li>• Selectează formatul băncii corespunzătoare</li>
              <li>• Încarcă fișierul și verifică tranzacțiile detectate</li>
              <li>• Categoriile vor fi atribuite automat pe baza descrierii</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSVForm;
