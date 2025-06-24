
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { FamilyProvider } from "@/contexts/FamilyContext";
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BudgetsAndGoals from './pages/BudgetsAndGoals';
import Investments from './pages/Investments';
import Family from "@/pages/Family";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FamilyProvider>
          <TransactionsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<BudgetsAndGoals />} />
                <Route path="/goals" element={<BudgetsAndGoals />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/family" element={<Family />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </TransactionsProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
