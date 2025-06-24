
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TickerResult {
  symbol: string;
  name: string;
  price: number;
  exchange?: string;
}

interface TickerSearchProps {
  onTickerSelect: (ticker: TickerResult) => void;
  value?: string;
  onChange?: (value: string) => void;
}

const TickerSearch = ({ onTickerSelect, value = "", onChange }: TickerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [results, setResults] = useState<TickerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_KEY = "M17KPMH7F1305YJ9";

  const searchTickers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchTerm}&apikey=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch ticker data');
      
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error('API limit reached. Please try again later.');
      }

      if (data['Information']) {
        throw new Error('API key issue. Please check your API key.');
      }

      const matches = data['bestMatches'] || [];
      const formattedResults: TickerResult[] = matches.slice(0, 5).map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        price: 0, // Will be fetched separately
        exchange: match['4. region']
      }));

      setResults(formattedResults);
    } catch (error: any) {
      console.error('Ticker search error:', error);
      toast({
        title: "Eroare la căutarea ticker-ului",
        description: error.message || "Nu s-au putut încărca datele. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTickerSelect = async (ticker: TickerResult) => {
    try {
      // Fetch current price for selected ticker
      const priceResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.symbol}&apikey=${API_KEY}`
      );
      
      const priceData = await priceResponse.json();
      const quote = priceData['Global Quote'];
      
      if (quote) {
        const currentPrice = parseFloat(quote['05. price']);
        onTickerSelect({
          ...ticker,
          price: currentPrice
        });
      } else {
        onTickerSelect(ticker);
      }
      
      setResults([]);
      setSearchTerm(ticker.symbol);
      onChange?.(ticker.symbol);
    } catch (error) {
      console.error('Price fetch error:', error);
      onTickerSelect(ticker);
    }
  };

  const handleSearchChange = (newValue: string) => {
    setSearchTerm(newValue);
    onChange?.(newValue);
    if (newValue !== value) {
      setResults([]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="ticker-search">Caută Ticker/Simbol</Label>
      <div className="flex gap-2">
        <Input
          id="ticker-search"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="ex: AAPL, MSFT, GOOGL"
          onKeyPress={(e) => e.key === 'Enter' && searchTickers()}
        />
        <Button 
          type="button" 
          onClick={searchTickers} 
          disabled={loading || !searchTerm.trim()}
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      
      {results.length > 0 && (
        <div className="border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 focus:outline-none focus:bg-gray-50"
              onClick={() => handleTickerSelect(result)}
            >
              <div className="font-medium">{result.symbol}</div>
              <div className="text-sm text-gray-600 truncate">{result.name}</div>
              {result.exchange && (
                <div className="text-xs text-gray-500">{result.exchange}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TickerSearch;
