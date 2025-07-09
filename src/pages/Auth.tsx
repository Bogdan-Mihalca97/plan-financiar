
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [pendingInvitation, setPendingInvitation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check for pending invitation
    const invitation = localStorage.getItem('pendingInvitation');
    if (invitation) {
      setPendingInvitation(invitation);
    }
  }, []);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Parolele nu se potrivesc");
        }
        await register(formData);
        // AuthContext will handle the redirect to dashboard
      }
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <PiggyBank className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">BugetControl</h1>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? "Bun Venit " : "Creează Cont"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Conectează-te la contul tău BugetControl" 
                : "Alătură-te la BugetControl și începe să îți gestionezi finanțele"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {pendingInvitation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Ai o invitație în așteptare
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Conectează-te sau creează un cont pentru a accepta invitația de familie.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenume</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Ion"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nume</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Popescu"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={isLogin ? "Introdu adresa de email" : "ion@exemplu.com"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Parola</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isLogin ? "Introdu parola" : "Creează o parolă puternică"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmă Parola</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmă parola"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (isLogin ? "Se conectează..." : "Se creează contul...") 
                  : (isLogin ? "Conectare" : "Creează Cont")
                }
              </Button>
              
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin 
                    ? "Nu ai cont? Înregistrează-te" 
                    : "Ai deja un cont? Conectează-te"
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600">
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
