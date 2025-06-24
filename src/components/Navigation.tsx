
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Target, PieChart, Users, BarChart3, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Tranzacții', icon: CreditCard },
    { path: '/budgets', label: 'Bugete', icon: Target },
    { path: '/goals', label: 'Obiective', icon: PieChart },
    { path: '/investments', label: 'Investiții', icon: TrendingUp },
    { path: '/family', label: 'Familie', icon: Users },
    { path: '/reports', label: 'Rapoarte', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">BugetControl</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userProfile && (
              <span className="text-sm text-gray-700">
                {userProfile.first_name} {userProfile.last_name}
              </span>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Deconectare
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
