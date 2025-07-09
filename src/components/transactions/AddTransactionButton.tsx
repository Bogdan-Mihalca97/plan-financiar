
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";
import ImportCSVForm from "./ImportCSVForm";

const AddTransactionButton = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button onClick={() => setIsAddOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Adaugă Tranzacție
      </Button>
      <Button variant="outline" onClick={() => setIsImportOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Importă CSV
      </Button>
      <AddTransactionForm 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
      <ImportCSVForm 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />
    </div>
  );
};

export default AddTransactionButton;
