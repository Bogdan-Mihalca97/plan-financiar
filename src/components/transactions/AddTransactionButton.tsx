
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";

const AddTransactionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Adaugă Tranzacție
      </Button>
      <AddTransactionForm 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default AddTransactionButton;
