
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, TrendingUp, TrendingDown, Target } from "lucide-react";

interface OverviewCardsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
}

const OverviewCards = ({ 
  balance, 
  totalIncome, 
  totalExpenses, 
  incomeTransactionCount, 
  expenseTransactionCount 
}: OverviewCardsProps) => {
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sold Luna</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance.toLocaleString('ro-RO')} Lei
          </div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? 'Situație pozitivă' : 'Atenție la cheltuieli'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Venituri Luna</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalIncome.toLocaleString('ro-RO')} Lei
          </div>
          <p className="text-xs text-muted-foreground">
            {incomeTransactionCount} tranzacții
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {totalExpenses.toLocaleString('ro-RO')} Lei
          </div>
          <p className="text-xs text-muted-foreground">
            {expenseTransactionCount} tranzacții
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rata Economisire</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Obiectiv: 30%</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
