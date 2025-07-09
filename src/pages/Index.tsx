
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, PiggyBank, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
            </div>
            <div className="space-x-4">
              <Button variant="outline" asChild>
                <Link to="/auth">Conectare</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Începe Acum</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planifică. Economisește. Controlează.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Planifică, urmărește și optimizează-ți bugetul cu instrumentele noastre intuitive. 
            Fă ca fiecare leu să conteze și atinge-ți obiectivele financiare.
          </p>
          <Button size="lg" asChild className="mr-4">
            <Link to="/auth">Începe Planificarea Acum</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth">Ai deja un cont?</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calculator className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Bugetare Inteligentă</CardTitle>
              <CardDescription>
                Creează bugete detaliate cu categorizare automată și analiză a cheltuielilor
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Urmărește Progresul</CardTitle>
              <CardDescription>
                Monitorizează obiectivele financiare cu grafice vizuale și indicatori de progres
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Planificare de Familie</CardTitle>
              <CardDescription>
                Colaborează cu membrii familiei și împarte responsabilitățile bugetului
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">De ce să alegi BugetControl?</h3>
            <p className="text-gray-600">Instrumentele de care ai nevoie pentru a-ți transforma viața financiară</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">Gratuit</div>
              <div className="text-gray-600">Să începi fără costuri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Securitate</div>
              <div className="text-gray-600">Datele tale sunt protejate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
