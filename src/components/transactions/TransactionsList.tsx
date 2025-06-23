import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";
import type { Transaction } from "@/contexts/TransactionsContext";

interface TransactionsListProps {
  searchTerm: string;
  transactions: Transaction[];
}

const TransactionsList = ({ searchTerm, transactions }: TransactionsListProps) => {
  // Filtrare după termenul de căutare
  const filteredTransactions = transactions.filter(transaction =>
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Alimentare": "bg-green-100 text-green-800",
      "Transport": "bg-blue-100 text-blue-800",
      "Utilități": "bg-yellow-100 text-yellow-800",
      "Salariu": "bg-purple-100 text-purple-800",
      "Divertisment": "bg-pink-100 text-pink-800",
      "Altele": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (filteredTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Toate Tranzacțiile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {transactions.length === 0 ? "Nu ai încă tranzacții" : "Nicio tranzacție găsită"}
            </h3>
            <p className="text-gray-500 mb-6">
              {transactions.length === 0 
                ? "Începe prin a adăuga prima ta tranzacție pentru a urmări veniturile și cheltuielile."
                : "Încearcă să modifici termenul de căutare pentru a găsi tranzacțiile dorite."
              }
            </p>
            {transactions.length === 0 && (
              <Button className="mx-auto">
                Adaugă Prima Tranzacție
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toate Tranzacțiile ({filteredTransactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descriere</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead className="text-right">Suma</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(transaction.amount, transaction.type)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
