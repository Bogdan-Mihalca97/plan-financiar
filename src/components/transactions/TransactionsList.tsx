
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import EditTransactionForm from "@/components/transactions/EditTransactionForm";
import { Transaction } from "@/types/transaction";
import { useTransactions } from "@/contexts/TransactionsContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
}

const TransactionsList = ({ transactions, onTransactionUpdated, onTransactionDeleted }: TransactionsListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { deleteTransaction } = useTransactions();

  const handleUpdateTransaction = () => {
    onTransactionUpdated();
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      onTransactionDeleted();
    } catch (error) {
      console.error('Error deleting transaction:', error);
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
                    {transaction.type === 'income' ? '+' : '-'}{Math.abs(transaction.amount).toFixed(2)} Lei
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Șterge Tranzacția</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ești sigur că vrei să ștergi tranzacția "{transaction.description}" în valoare de {Math.abs(transaction.amount).toFixed(2)} Lei?
                            Această acțiune nu poate fi anulată.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingTransaction && (
          <EditTransactionForm
            transaction={editingTransaction}
            isOpen={!!editingTransaction}
            onClose={() => setEditingTransaction(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
