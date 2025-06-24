import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from '@/contexts/TransactionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import BudgetChart from '@/components/reports/BudgetChart';
import ExpenseChart from '@/components/reports/ExpenseChart';
import TrendChart from '@/components/reports/TrendChart';
import CategoryBreakdown from '@/components/reports/CategoryBreakdown';

const Reports = () => {
  const { isAuthenticated, loading } = useAuth();
  const { transactions } = useTransactions();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Se încarcă...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rapoarte Financiare</h1>
            <p className="text-gray-600 mt-2">Analizează-ți situația financiară cu grafice detaliate</p>
          </div>

          {!hasTransactions ? (
            <Card>
              <CardHeader>
                <CardTitle>Nu există date pentru afișare</CardTitle>
                <CardDescription>
                  Pentru a vizualiza rapoarte, adaugă câteva tranzacții în secțiunea Tranzacții.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Prezentare Generală</TabsTrigger>
                <TabsTrigger value="budget">Bugete</TabsTrigger>
                <TabsTrigger value="trends">Tendințe</TabsTrigger>
                <TabsTrigger value="categories">Categorii</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Venituri vs Cheltuieli</CardTitle>
                      <CardDescription>Comparația lunară a veniturilor și cheltuielilor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExpenseChart />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuția pe Categorii</CardTitle>
                      <CardDescription>Cheltuielile grupate pe categorii</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CategoryBreakdown />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="budget">
                <Card>
                  <CardHeader>
                    <CardTitle>Analiza Bugetelor</CardTitle>
                    <CardDescription>Comparația între bugetele planificate și cheltuielile reale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BudgetChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendințe Financiare</CardTitle>
                    <CardDescription>Evoluția economiilor și cheltuielilor în timp</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TrendChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Analiza Categoriilor</CardTitle>
                    <CardDescription>Distribuția detaliată a cheltuielilor pe categorii</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
