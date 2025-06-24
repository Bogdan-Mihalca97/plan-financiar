
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  symbol: string | null;
  current_price: number;
}

interface RefreshPricesButtonProps {
  investments: Investment[];
  onRefresh: () => void;
}

const RefreshPricesButton = ({ investments, onRefresh }: RefreshPricesButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_KEY = "M17KPMH7F1305YJ9";

  const refreshPrices = async () => {
    setLoading(true);
    
    try {
      const investmentsWithSymbols = investments.filter(inv => inv.symbol);
      
      if (investmentsWithSymbols.length === 0) {
        toast({
          title: "Info",
          description: "Nu există investiții cu simboluri pentru actualizare.",
        });
        return;
      }

      let updatedCount = 0;

      for (const investment of investmentsWithSymbols) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${investment.symbol}&apikey=${API_KEY}`
          );
          
          const data = await response.json();
          const quote = data['Global Quote'];
          
          if (quote && quote['05. price']) {
            const newPrice = parseFloat(quote['05. price']);
            
            const { error } = await supabase
              .from('investments')
              .update({ current_price: newPrice })
              .eq('id', investment.id);
            
            if (!error) {
              updatedCount++;
            }
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error updating price for ${investment.symbol}:`, error);
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "Prețuri actualizate!",
          description: `Au fost actualizate ${updatedCount} investiții.`,
        });
        onRefresh();
      } else {
        toast({
          title: "Info",
          description: "Nu s-au putut actualiza prețurile. Încearcă din nou mai târziu.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error refreshing prices:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea prețurilor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={refreshPrices} 
      disabled={loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Actualizare...' : 'Actualizează Prețuri'}
    </Button>
  );
};

export default RefreshPricesButton;
