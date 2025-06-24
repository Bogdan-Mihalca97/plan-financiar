import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import { Toaster } from "@/components/ui/toaster"
import { FamilyProvider } from "@/contexts/FamilyContext";
import Family from "@/pages/Family";

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <FamilyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/family" element={<Family />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </FamilyProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
