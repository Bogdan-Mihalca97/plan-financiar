
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import EditTransactionForm from "@/components/transactions/EditTransactionForm";
import { Transaction } from "@/types/transaction";

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
}

const TransactionsList = ({ transactions, onTransactionUpdated, onTransactionDeleted }: TransactionsListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleUpdateTransaction = () => {
    onTransactionUpdated();
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("Ești sigur că vrei să ștergi această tranzacție?")) {
      onTransactionDeleted();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Tranzacțiilor</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nu ai încă tranzacții înregistrate.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  transaction.family_group_id 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      {transaction.family_group_id && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Familie
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toFixed(2)} RON
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingTransaction && (
          <EditTransactionForm
            transaction={editingTransaction}
            onClose={() => setEditingTransaction(null)}
            onTransactionUpdated={handleUpdateTransaction}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
