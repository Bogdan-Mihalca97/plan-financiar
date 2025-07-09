import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { InvestmentsProvider } from "@/contexts/InvestmentsContext";
import { BudgetsProvider } from "@/contexts/BudgetsContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import Auth from "@/pages/Auth";
import Investments from "@/pages/Investments";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Goals from "@/pages/Goals";
import Family from "@/pages/Family";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FamilyProvider>
        <TransactionsProvider>
          <InvestmentsProvider>
            <BudgetsProvider>
              <GoalsProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/family" element={<Family />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </GoalsProvider>
            </BudgetsProvider>
          </InvestmentsProvider>
        </TransactionsProvider>
      </FamilyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
