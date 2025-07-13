
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, X, Calendar, DollarSign, Tag } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilteredTransactions: (filtered: Transaction[]) => void;
}

interface FilterState {
  search: string;
  type: string;
  category: string;
  dateRange: string;
  amountRange: string;
}

const TransactionFilters = ({ transactions, onFilteredTransactions }: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    category: '',
    dateRange: '',
    amountRange: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories from transactions
  const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...transactions];

    // Search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (newFilters.type) {
      filtered = filtered.filter(t => t.type === newFilters.type);
    }

    // Category filter
    if (newFilters.category) {
      filtered = filtered.filter(t => t.category === newFilters.category);
    }

    // Date range filter
    if (newFilters.dateRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (newFilters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (newFilters.dateRange !== 'all') {
        filtered = filtered.filter(t => new Date(t.date) >= startDate);
      }
    }

    // Amount range filter
    if (newFilters.amountRange) {
      switch (newFilters.amountRange) {
        case 'small':
          filtered = filtered.filter(t => Math.abs(t.amount) < 100);
          break;
        case 'medium':
          filtered = filtered.filter(t => Math.abs(t.amount) >= 100 && Math.abs(t.amount) < 1000);
          break;
        case 'large':
          filtered = filtered.filter(t => Math.abs(t.amount) >= 1000);
          break;
      }
    }

    onFilteredTransactions(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      type: '',
      category: '',
      dateRange: '',
      amountRange: ''
    };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search and main controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută tranzacții (descriere, categorie...)"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtre
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Șterge
                </Button>
              )}
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Tip
                </label>
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate tipurile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toate tipurile</SelectItem>
                    <SelectItem value="income">Venituri</SelectItem>
                    <SelectItem value="expense">Cheltuieli</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Categorie
                </label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate categoriile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toate categoriile</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Perioadă
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate perioadele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toate perioadele</SelectItem>
                    <SelectItem value="today">Astăzi</SelectItem>
                    <SelectItem value="week">Ultima săptămână</SelectItem>
                    <SelectItem value="month">Ultima lună</SelectItem>
                    <SelectItem value="year">Ultimul an</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Sumă
                </label>
                <Select value={filters.amountRange} onValueChange={(value) => updateFilter('amountRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate sumele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toate sumele</SelectItem>
                    <SelectItem value="small">Sub 100 Lei</SelectItem>
                    <SelectItem value="medium">100 - 1000 Lei</SelectItem>
                    <SelectItem value="large">Peste 1000 Lei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Filtre active:</span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Căutare: "{filters.search}"
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="text-xs">
                  Tip: {filters.type === 'income' ? 'Venituri' : 'Cheltuieli'}
                  <button
                    onClick={() => updateFilter('type', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="text-xs">
                  Categorie: {filters.category}
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="secondary" className="text-xs">
                  Perioadă: {filters.dateRange}
                  <button
                    onClick={() => updateFilter('dateRange', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.amountRange && (
                <Badge variant="secondary" className="text-xs">
                  Sumă: {filters.amountRange}
                  <button
                    onClick={() => updateFilter('amountRange', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
