
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useGoals } from "@/contexts/GoalsContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useInvestments } from "@/contexts/InvestmentsContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const ExportFamilyPDF = () => {
  const { currentFamily } = useFamily();
  const { familyTransactions, getTotalIncome, getTotalExpenses, getBalance } = useTransactions();
  const { familyGoals } = useGoals();
  const { familyBudgets } = useBudgets();
  const { familyInvestments } = useInvestments();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!currentFamily) {
      toast({
        title: "Eroare",
        description: "Nu există date de familie pentru export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Raport Financiar Familie - BugetControl', 20, yPosition);
      yPosition += 20;

      // Family name
      doc.setFontSize(16);
      doc.text(`Familie: ${currentFamily.name}`, 20, yPosition);
      yPosition += 15;

      // Date
      doc.setFontSize(12);
      doc.text(`Generat la: ${new Date().toLocaleDateString('ro-RO')}`, 20, yPosition);
      yPosition += 20;

      // Financial Overview
      doc.setFontSize(14);
      doc.text('Rezumat Financiar:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.text(`Total Venituri: ${getTotalIncome()} Lei`, 25, yPosition);
      yPosition += 6;
      doc.text(`Total Cheltuieli: ${getTotalExpenses()} Lei`, 25, yPosition);
      yPosition += 6;
      doc.text(`Sold Curent: ${getBalance()} Lei`, 25, yPosition);
      yPosition += 20;

      // Family Transactions
      if (familyTransactions.length > 0) {
        doc.setFontSize(14);
        doc.text('Tranzacții Familie:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(9);
        familyTransactions.slice(0, 20).forEach((transaction, index) => {
          const date = new Date(transaction.date).toLocaleDateString('ro-RO');
          const amount = transaction.type === 'income' ? `+${transaction.amount}` : `-${transaction.amount}`;
          const color = transaction.type === 'income' ? 'green' : 'red';
          
          doc.text(`${date} - ${transaction.description}`, 25, yPosition);
          yPosition += 4;
          doc.text(`${amount} Lei (${transaction.category})`, 25, yPosition);
          yPosition += 8;

          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
        yPosition += 10;
      }

      // Family Budgets
      if (familyBudgets.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Bugete Familie:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        familyBudgets.forEach((budget, index) => {
          doc.text(`${budget.category}: ${budget.limit_amount} Lei (${budget.period})`, 25, yPosition);
          yPosition += 8;

          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
        yPosition += 15;
      }

      // Family Goals
      if (familyGoals.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Obiective Familie:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        familyGoals.forEach((goal, index) => {
          const progress = ((goal.current_amount / goal.target_amount) * 100).toFixed(1);
          const deadline = new Date(goal.deadline).toLocaleDateString('ro-RO');
          
          doc.text(`${goal.title}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Progres: ${goal.current_amount}/${goal.target_amount} Lei (${progress}%)`, 25, yPosition);
          yPosition += 5;
          doc.text(`Termen limită: ${deadline}`, 25, yPosition);
          yPosition += 10;

          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
        yPosition += 15;
      }

      // Family Investments
      if (familyInvestments.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Investiții Familie:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        let totalInvestmentValue = 0;
        let totalInvestmentCost = 0;

        familyInvestments.forEach((investment, index) => {
          const currentValue = investment.current_price * investment.quantity;
          const purchaseValue = investment.purchase_price * investment.quantity;
          const profit = currentValue - purchaseValue;
          const profitPercent = ((profit / purchaseValue) * 100).toFixed(2);
          
          totalInvestmentValue += currentValue;
          totalInvestmentCost += purchaseValue;

          doc.text(`${investment.name} (${investment.symbol || investment.type})`, 25, yPosition);
          yPosition += 5;
          doc.text(`Cantitate: ${investment.quantity} | Preț actual: ${investment.current_price} Lei`, 25, yPosition);
          yPosition += 5;
          doc.text(`Valoare actuală: ${currentValue.toFixed(2)} Lei | Profit: ${profit.toFixed(2)} Lei (${profitPercent}%)`, 25, yPosition);
          yPosition += 10;

          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });

        // Investment summary
        const totalProfit = totalInvestmentValue - totalInvestmentCost;
        const totalProfitPercent = ((totalProfit / totalInvestmentCost) * 100).toFixed(2);
        
        yPosition += 5;
        doc.setFontSize(12);
        doc.text('Rezumat Investiții:', 25, yPosition);
        yPosition += 8;
        doc.setFontSize(11);
        doc.text(`Valoare totală: ${totalInvestmentValue.toFixed(2)} Lei`, 25, yPosition);
        yPosition += 6;
        doc.text(`Cost total: ${totalInvestmentCost.toFixed(2)} Lei`, 25, yPosition);
        yPosition += 6;
        doc.text(`Profit total: ${totalProfit.toFixed(2)} Lei (${totalProfitPercent}%)`, 25, yPosition);
      }

      // Footer
      yPosition += 20;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(8);
      doc.text(`Generat la: ${new Date().toLocaleString('ro-RO')}`, 20, yPosition);
      doc.text('BugetControl - Gestionarea bugetului familiei', 20, yPosition + 5);

      // Save the PDF
      const fileName = `Raport_Financiar_${currentFamily.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Export Reușit",
        description: "Raportul financiar al familiei a fost descărcat cu succes",
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Eroare Export",
        description: "A apărut o eroare la exportul PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentFamily) {
    return null;
  }

  return (
    <Button 
      onClick={exportToPDF}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Download className="h-4 w-4 animate-spin" />
          Se exportă...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Export Raport Financiar
        </>
      )}
    </Button>
  );
};

export default ExportFamilyPDF;
