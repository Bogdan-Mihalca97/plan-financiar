
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
  // Start with empty transactions for new users
  const mockTransactions: Transaction[] = [];

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
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nu ai încă tranzacții</h3>
          <p className="text-gray-500 mb-6">
            Începe prin a adăuga prima ta tranzacție pentru a urmări veniturile și cheltuielile.
          </p>
          <Button className="mx-auto">
            Adaugă Prima Tranzacție
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
