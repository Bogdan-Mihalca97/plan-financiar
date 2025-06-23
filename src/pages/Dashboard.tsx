import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, TrendingUp, Wallet, CreditCard, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <PiggyBank className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Tranzacții
                </Link>
                <Link to="/budgets" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Bugete
                </Link>
                <Link to="/goals" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Obiective
                </Link>
                <Link to="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Rapoarte
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bună, {user?.firstName}!</span>
              <Button variant="outline" onClick={logout}>
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bun venit, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Începe prin a adăuga prima ta tranzacție pentru a-ți gestiona bugetul
          </p>
        </div>

        {/* Overview Cards - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Lei</div>
              <p className="text-xs text-muted-foreground">Adaugă tranzacții pentru a vedea soldul</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheltuieli Luna</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Lei</div>
              <p className="text-xs text-muted-foreground">Nu ai cheltuieli înregistrate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obiectiv Economii</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Setează primul tău obiectiv</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Acțiuni Rapide</CardTitle>
              <CardDescription>Începe să îți gestionezi bugetul</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link to="/transactions">
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă Prima Tranzacție
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/budgets">
                  <Target className="mr-2 h-4 w-4" />
                  Creează Primul Buget
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/goals">
                  <Target className="mr-2 h-4 w-4" />
                  Setează Primul Obiectiv
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Vezi Rapoarte
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tranzacții Recente</CardTitle>
              <CardDescription>Ultimele tale tranzacții</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Nu ai încă tranzacții adăugate</p>
                <Button asChild variant="outline">
                  <Link to="/transactions">Adaugă Prima Tranzacție</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
