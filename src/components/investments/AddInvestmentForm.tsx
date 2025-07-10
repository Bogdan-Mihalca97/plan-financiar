
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
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import TickerSearch from "./TickerSearch";

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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentFamily } = useFamily();

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validare nume
    if (!formData.name.trim()) {
      newErrors.name = "Numele investiției este obligatoriu";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Numele trebuie să aibă cel puțin 2 caractere";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Numele nu poate avea mai mult de 100 de caractere";
    }

    // Validare tip
    if (!formData.type) {
      newErrors.type = "Tipul investiției este obligatoriu";
    }

    // Validare preț cumpărare
    if (!formData.purchase_price) {
      newErrors.purchase_price = "Prețul de cumpărare este obligatoriu";
    } else {
      const price = parseFloat(formData.purchase_price);
      if (isNaN(price)) {
        newErrors.purchase_price = "Prețul trebuie să fie un număr valid";
      } else if (price <= 0) {
        newErrors.purchase_price = "Prețul trebuie să fie mai mare decât 0";
      } else if (price > 10000000) {
        newErrors.purchase_price = "Prețul nu poate fi mai mare de 10.000.000 Lei";
      }
    }

    // Validare preț curent
    if (!formData.current_price) {
      newErrors.current_price = "Prețul curent este obligatoriu";
    } else {
      const price = parseFloat(formData.current_price);
      if (isNaN(price)) {
        newErrors.current_price = "Prețul trebuie să fie un număr valid";
      } else if (price <= 0) {
        newErrors.current_price = "Prețul trebuie să fie mai mare decât 0";
      } else if (price > 10000000) {
        newErrors.current_price = "Prețul nu poate fi mai mare de 10.000.000 Lei";
      }
    }

    // Validare cantitate
    if (!formData.quantity) {
      newErrors.quantity = "Cantitatea este obligatorie";
    } else {
      const qty = parseFloat(formData.quantity);
      if (isNaN(qty)) {
        newErrors.quantity = "Cantitatea trebuie să fie un număr valid";
      } else if (qty <= 0) {
        newErrors.quantity = "Cantitatea trebuie să fie mai mare decât 0";
      } else if (qty > 1000000) {
        newErrors.quantity = "Cantitatea nu poate fi mai mare de 1.000.000";
      }
    }

    // Validare dată cumpărare
    if (!formData.purchase_date) {
      newErrors.purchase_date = "Data de cumpărare este obligatorie";
    } else {
      const purchaseDate = new Date(formData.purchase_date);
      const today = new Date();
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(today.getFullYear() - 10);
      
      if (purchaseDate > today) {
        newErrors.purchase_date = "Data de cumpărare nu poate fi în viitor";
      } else if (purchaseDate < tenYearsAgo) {
        newErrors.purchase_date = "Data de cumpărare nu poate fi mai veche de 10 ani";
      }
    }

    // Validare simbol (opțional, dar dacă e completat să fie valid)
    if (formData.symbol && formData.symbol.trim().length > 10) {
      newErrors.symbol = "Simbolul nu poate avea mai mult de 10 caractere";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTickerSelect = (ticker: any) => {
    setFormData(prev => ({
      ...prev,
      name: ticker.name,
      symbol: ticker.symbol,
      current_price: ticker.price > 0 ? ticker.price.toString() : prev.current_price,
      type: prev.type || "Acțiuni"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii conectat pentru a adăuga o investiție",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Eroare de validare",
        description: "Te rog corectează erorile din formular",
        variant: "destructive"
      });
      return;
    }

    if (loading) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.from('investments').insert({
        user_id: user.id,
        name: formData.name.trim(),
        type: formData.type,
        symbol: formData.symbol.trim() || null,
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

      handleClose();
    } catch (error: any) {
      console.error('Error adding investment:', error);
      toast({
        title: "Eroare la adăugarea investiției",
        description: error.message || "A apărut o eroare la adăugarea investiției.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "",
      symbol: "",
      purchase_price: "",
      current_price: "",
      quantity: "",
      purchase_date: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă Investiție Nouă</DialogTitle>
          <DialogDescription>
            Completează detaliile investiției tale pentru a o urmări în portofoliu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <TickerSearch 
            onTickerSelect={handleTickerSelect}
            value={formData.symbol}
            onChange={(value) => handleInputChange("symbol", value)}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nume Investiție *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="ex: Apple Inc."
              className={errors.name ? 'border-red-500' : ''}
              required
              disabled={loading}
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tip Investiție *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange("type", value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
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
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantitate *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                max="1000000"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="1.5"
                className={errors.quantity ? 'border-red-500' : ''}
                required
                disabled={loading}
              />
              {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data Cumpărare *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                className={errors.purchase_date ? 'border-red-500' : ''}
                required
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.purchase_date && <p className="text-sm text-red-600">{errors.purchase_date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Preț Cumpărare (Lei) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0.01"
                max="10000000"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                placeholder="100.50"
                className={errors.purchase_price ? 'border-red-500' : ''}
                required
                disabled={loading}
              />
              {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price">Preț Curent (Lei) *</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                min="0.01"
                max="10000000"
                value={formData.current_price}
                onChange={(e) => handleInputChange("current_price", e.target.value)}
                placeholder="105.75"
                className={errors.current_price ? 'border-red-500' : ''}
                required
                disabled={loading}
              />
              {errors.current_price && <p className="text-sm text-red-600">{errors.current_price}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
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
