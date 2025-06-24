
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddInvestmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddInvestmentForm = ({ isOpen, onClose }: AddInvestmentFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    symbol: "",
    purchase_price: "",
    current_price: "",
    quantity: "",
    purchase_date: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const investmentTypes = [
    "Acțiuni",
    "Obligațiuni", 
    "ETF",
    "Fonduri mutuale",
    "Criptomonede",
    "Aur",
    "Imobiliare",
    "Altele"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.purchase_price || !formData.current_price || !formData.quantity || !formData.purchase_date) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile obligatorii.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizatorul nu este autentificat');

      const { error } = await supabase.from('investments' as any).insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        symbol: formData.symbol || null,
        purchase_price: parseFloat(formData.purchase_price),
        current_price: parseFloat(formData.current_price),
        quantity: parseFloat(formData.quantity),
        purchase_date: formData.purchase_date,
      });

      if (error) throw error;

      toast({
        title: "Succes!",
        description: "Investiția a fost adăugată cu succes.",
      });

      // Reset form
      setFormData({
        name: "",
        type: "",
        symbol: "",
        purchase_price: "",
        current_price: "",
        quantity: "",
        purchase_date: "",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error adding investment:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la adăugarea investiției.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă Investiție Nouă</DialogTitle>
          <DialogDescription>
            Completează detaliile investiției tale pentru a o urmări în portofoliu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume Investiție *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="ex: Apple Inc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tip Investiție *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează tipul investiției" />
              </SelectTrigger>
              <SelectContent>
                {investmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Simbol/Ticker (opțional)</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => handleInputChange("symbol", e.target.value)}
              placeholder="ex: AAPL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantitate *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="1.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data Cumpărare *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Preț Cumpărare (Lei) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                placeholder="100.50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price">Preț Curent (Lei) *</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={(e) => handleInputChange("current_price", e.target.value)}
                placeholder="105.75"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Se adaugă..." : "Adaugă Investiția"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvestmentForm;
