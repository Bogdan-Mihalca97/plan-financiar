
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
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Investments from "@/pages/Investments";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Goals from "@/pages/Goals";
import BudgetsAndGoals from "@/pages/BudgetsAndGoals";
import Family from "@/pages/Family";
import Profile from "@/pages/Profile";
import Reports from "@/pages/Reports";
import UMLDiagramsPage from "@/pages/UMLDiagrams";
import UMLPage from "@/pages/UML";

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
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/budgets-and-goals" element={<BudgetsAndGoals />} />
                      <Route path="/family" element={<Family />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/uml-diagrams" element={<UMLDiagramsPage />} />
                      <Route path="/uml" element={<UMLPage />} />
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
