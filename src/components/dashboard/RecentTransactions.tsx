
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Transaction } from "@/contexts/TransactionsContext";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatAmount = (amount: number, type: "income" | "expense") => {
    const sign = type === "income" ? "+" : "-";
    const color = type === "income" ? "text-green-600" : "text-red-600";
    return (
      <span className={`font-medium ${color}`}>
        {sign}{amount} Lei
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tranzacții Recente</CardTitle>
        <CardDescription>Ultimele 5 tranzacții adăugate</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.date)} • {transaction.category}
                  </p>
                </div>
                <div className="text-right">
                  {formatAmount(transaction.amount, transaction.type)}
                </div>
              </div>
            ))}
            <div className="pt-3">
              <Button asChild variant="outline" className="w-full">
                <Link to="/transactions">Vezi toate tranzacțiile</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nu ai tranzacții încă</p>
            <Button asChild>
              <Link to="/transactions">
                <Plus className="mr-2 h-4 w-4" />
                Adaugă prima tranzacție
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
