
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

interface TransactionsListProps {
  searchTerm: string;
}

const TransactionsList = ({ searchTerm }: TransactionsListProps) => {
  // Mock data pentru tranzacții
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      description: "Cumpărături alimentare",
      amount: 250,
      category: "Alimentare",
      type: "expense",
      date: "2024-12-23"
    },
    {
      id: "2", 
      description: "Salariu",
      amount: 4500,
      category: "Salariu",
      type: "income",
      date: "2024-12-01"
    },
    {
      id: "3",
      description: "Benzină",
      amount: 180,
      category: "Transport", 
      type: "expense",
      date: "2024-11-29"
    },
    {
      id: "4",
      description: "Freelancing proiect",
      amount: 800,
      category: "Freelancing",
      type: "income",
      date: "2024-11-25"
    },
    {
      id: "5",
      description: "Factura electricitate",
      amount: 120,
      category: "Utilități",
      type: "expense",
      date: "2024-11-20"
    }
  ];

  // Filtrare după termenul de căutare
  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAmount = (amount: number, type: "income" | "expense") => {
    const sign = type === "income" ? "+" : "-";
    const color = type === "income" ? "text-green-600" : "text-red-600";
    return (
      <span className={`font-medium ${color}`}>
        {sign}{amount} Lei
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toate Tranzacțiile</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? "Nu s-au găsit tranzacții care să corespundă căutării." : "Nu ai încă tranzacții adăugate."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descriere</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Suma</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                      {transaction.type === "income" ? "Venit" : "Cheltuială"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
