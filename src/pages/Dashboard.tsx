
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import OverviewCards from "@/components/dashboard/OverviewCards";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

const Dashboard = () => {
  const { isAuthenticated, loading, userProfile } = useAuth();
  const { 
    allTransactions,
    getTotalIncome, 
    getTotalExpenses, 
    getBalance, 
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlyBalance,
    getTransactionsByCategory 
  } = useTransactions();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Calculate monthly statistics for dashboard cards
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlyBalance = getMonthlyBalance();
  const expensesByCategory = getTransactionsByCategory();

  // Calculate current month transactions count
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = allTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const incomeTransactionCount = currentMonthTransactions.filter(t => t.type === 'income').length;
  const expenseTransactionCount = currentMonthTransactions.filter(t => t.type === 'expense').length;
  const totalTransactionCount = currentMonthTransactions.length;

  console.log('Current month transactions:', {
    total: totalTransactionCount,
    income: incomeTransactionCount,
    expenses: expenseTransactionCount,
    allTransactions: allTransactions.length
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection userName={userProfile?.first_name} />
        
        <OverviewCards
          balance={monthlyBalance}
          totalIncome={monthlyIncome}
          totalExpenses={monthlyExpenses}
          incomeTransactionCount={incomeTransactionCount}
          expenseTransactionCount={expenseTransactionCount}
          totalTransactionCount={totalTransactionCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BudgetOverview expensesByCategory={expensesByCategory} />
          <RecentTransactions transactions={allTransactions} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
