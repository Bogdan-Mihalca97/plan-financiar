
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
  const { goals, familyGoals } = useGoals();
  const { budgets, familyBudgets } = useBudgets();
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
      let yPosition = 30;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Colors
      const primaryColor = [34, 40, 80]; // Dark blue
      const secondaryColor = [66, 135, 245]; // Light blue
      const successColor = [16, 185, 129]; // Green
      const dangerColor = [239, 68, 68]; // Red
      const grayColor = [107, 114, 128]; // Gray
      const lightGrayColor = [243, 244, 246]; // Light gray

      // Helper function to add colored rectangle
      const addColoredRect = (x: number, y: number, width: number, height: number, color: number[]) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x, y, width, height, 'F');
      };

      // Helper function to add section header
      const addSectionHeader = (title: string, color: number[] = primaryColor) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        addColoredRect(margin, yPosition - 5, contentWidth, 12, color);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, yPosition + 3);
        yPosition += 20;
        doc.setTextColor(0, 0, 0);
      };

      // Helper function to add info box
      const addInfoBox = (label: string, value: string, color: number[] = lightGrayColor, textColor: number[] = [0, 0, 0]) => {
        const boxHeight = 25;
        addColoredRect(margin, yPosition, contentWidth / 3 - 5, boxHeight, color);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin + 5, yPosition + 8);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 5, yPosition + 18);
        
        doc.setTextColor(0, 0, 0);
      };

      // Header with logo area
      addColoredRect(0, 0, pageWidth, 25, primaryColor);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BugetControl - Raport Financiar', margin, 16);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generat la: ${new Date().toLocaleDateString('ro-RO')}`, pageWidth - 80, 16);
      
      yPosition = 40;
      doc.setTextColor(0, 0, 0);

      // Family info
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Familie: ${currentFamily.name}`, margin, yPosition);
      yPosition += 25;

      // Financial Overview Section
      addSectionHeader('📊 Rezumat Financiar', secondaryColor);
      
      const totalIncome = getTotalIncome();
      const totalExpenses = getTotalExpenses();
      const balance = getBalance();
      
      // Financial boxes
      addInfoBox('Total Venituri', `${totalIncome.toFixed(2)} Lei`, [220, 252, 231], successColor);
      addInfoBox('Total Cheltuieli', `${totalExpenses.toFixed(2)} Lei`, [254, 226, 226], dangerColor);
      addInfoBox('Sold Curent', `${balance.toFixed(2)} Lei`, balance >= 0 ? [220, 252, 231] : [254, 226, 226], balance >= 0 ? successColor : dangerColor);
      
      yPosition += 35;

      // Transactions Section
      if (familyTransactions.length > 0) {
        addSectionHeader('💰 Tranzacții Familie', secondaryColor);
        
        // Add table headers
        addColoredRect(margin, yPosition, contentWidth, 8, lightGrayColor);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Data', margin + 5, yPosition + 5);
        doc.text('Descriere', margin + 40, yPosition + 5);
        doc.text('Suma', margin + 120, yPosition + 5);
        doc.text('Categorie', margin + 150, yPosition + 5);
        yPosition += 12;

        doc.setFont('helvetica', 'normal');
        familyTransactions.slice(0, 15).forEach((transaction) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
          }
          
          const date = new Date(transaction.date).toLocaleDateString('ro-RO');
          const amount = transaction.type === 'income' ? `+${transaction.amount}` : `-${transaction.amount}`;
          const color = transaction.type === 'income' ? successColor : dangerColor;
          
          // Alternating row colors
          if (familyTransactions.indexOf(transaction) % 2 === 0) {
            addColoredRect(margin, yPosition - 2, contentWidth, 8, [249, 250, 251]);
          }
          
          doc.setTextColor(0, 0, 0);
          doc.text(date, margin + 5, yPosition + 3);
          doc.text(transaction.description.substring(0, 25) + (transaction.description.length > 25 ? '...' : ''), margin + 40, yPosition + 3);
          
          doc.setTextColor(color[0], color[1], color[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(`${amount} Lei`, margin + 120, yPosition + 3);
          
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFont('helvetica', 'normal');
          doc.text(transaction.category, margin + 150, yPosition + 3);
          
          yPosition += 10;
        });
        yPosition += 10;
      }

      // Personal Budgets Section
      if (budgets.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }

        addSectionHeader('📋 Bugete Personale', secondaryColor);
        
        budgets.forEach((budget) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
          }
          
          addColoredRect(margin, yPosition, contentWidth, 20, lightGrayColor);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(budget.category, margin + 5, yPosition + 8);
          
          doc.setFont('helvetica', 'normal');
          doc.text(`Limită: ${budget.limit_amount} Lei`, margin + 5, yPosition + 15);
          doc.text(`Perioada: ${budget.period}`, margin + 120, yPosition + 15);
          
          yPosition += 25;
        });
        yPosition += 10;
      }

      // Family Budgets Section
      if (familyBudgets.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }

        addSectionHeader('📋 Bugete Familie', secondaryColor);
        
        familyBudgets.forEach((budget) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
          }
          
          addColoredRect(margin, yPosition, contentWidth, 20, lightGrayColor);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(budget.category, margin + 5, yPosition + 8);
          
          doc.setFont('helvetica', 'normal');
          doc.text(`Limită: ${budget.limit_amount} Lei`, margin + 5, yPosition + 15);
          doc.text(`Perioada: ${budget.period}`, margin + 120, yPosition + 15);
          
          yPosition += 25;
        });
        yPosition += 10;
      }

      // Personal Goals Section
      if (goals.length > 0) {
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 30;
        }

        addSectionHeader('🎯 Obiective Personale', secondaryColor);
        
        goals.forEach((goal) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }
          
          const progress = ((goal.current_amount / goal.target_amount) * 100);
          const deadline = new Date(goal.deadline).toLocaleDateString('ro-RO');
          
          addColoredRect(margin, yPosition, contentWidth, 25, lightGrayColor);
          
          // Progress bar
          const progressBarWidth = (contentWidth - 20) * (progress / 100);
          addColoredRect(margin + 10, yPosition + 18, progressBarWidth, 4, successColor);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(goal.title, margin + 5, yPosition + 8);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`${goal.current_amount}/${goal.target_amount} Lei (${progress.toFixed(1)}%)`, margin + 5, yPosition + 15);
          doc.text(`Termen: ${deadline}`, margin + 120, yPosition + 15);
          
          yPosition += 30;
        });
        yPosition += 10;
      }

      // Family Goals Section
      if (familyGoals.length > 0) {
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 30;
        }

        addSectionHeader('🎯 Obiective Familie', secondaryColor);
        
        familyGoals.forEach((goal) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }
          
          const progress = ((goal.current_amount / goal.target_amount) * 100);
          const deadline = new Date(goal.deadline).toLocaleDateString('ro-RO');
          
          addColoredRect(margin, yPosition, contentWidth, 25, lightGrayColor);
          
          // Progress bar
          const progressBarWidth = (contentWidth - 20) * (progress / 100);
          addColoredRect(margin + 10, yPosition + 18, progressBarWidth, 4, successColor);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(goal.title, margin + 5, yPosition + 8);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`${goal.current_amount}/${goal.target_amount} Lei (${progress.toFixed(1)}%)`, margin + 5, yPosition + 15);
          doc.text(`Termen: ${deadline}`, margin + 120, yPosition + 15);
          
          yPosition += 30;
        });
        yPosition += 10;
      }

      // Investments Section
      if (familyInvestments.length > 0) {
        if (yPosition > 150) {
          doc.addPage();
          yPosition = 30;
        }

        addSectionHeader('📈 Investiții Familie', secondaryColor);
        
        let totalInvestmentValue = 0;
        let totalInvestmentCost = 0;

        familyInvestments.forEach((investment) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }
          
          const currentValue = investment.current_price * investment.quantity;
          const purchaseValue = investment.purchase_price * investment.quantity;
          const profit = currentValue - purchaseValue;
          const profitPercent = ((profit / purchaseValue) * 100);
          
          totalInvestmentValue += currentValue;
          totalInvestmentCost += purchaseValue;

          const bgColor = profit >= 0 ? [220, 252, 231] : [254, 226, 226];
          const profitColor = profit >= 0 ? successColor : dangerColor;
          
          addColoredRect(margin, yPosition, contentWidth, 25, bgColor);
          
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${investment.name} (${investment.symbol || investment.type})`, margin + 5, yPosition + 8);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Cantitate: ${investment.quantity} | Preț: ${investment.current_price} Lei`, margin + 5, yPosition + 15);
          
          doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(`Valoare: ${currentValue.toFixed(2)} Lei | Profit: ${profit.toFixed(2)} Lei (${profitPercent.toFixed(2)}%)`, margin + 5, yPosition + 22);
          
          yPosition += 30;
        });

        // Investment summary
        const totalProfit = totalInvestmentValue - totalInvestmentCost;
        const totalProfitPercent = ((totalProfit / totalInvestmentCost) * 100);
        
        addSectionHeader('📊 Rezumat Investiții', secondaryColor);
        
        addInfoBox('Valoare Totală', `${totalInvestmentValue.toFixed(2)} Lei`, lightGrayColor);
        addInfoBox('Cost Total', `${totalInvestmentCost.toFixed(2)} Lei`, lightGrayColor);
        addInfoBox('Profit Total', `${totalProfit.toFixed(2)} Lei (${totalProfitPercent.toFixed(2)}%)`, 
                  totalProfit >= 0 ? [220, 252, 231] : [254, 226, 226], 
                  totalProfit >= 0 ? successColor : dangerColor);
        
        yPosition += 35;
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addColoredRect(0, doc.internal.pageSize.height - 15, pageWidth, 15, primaryColor);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`BugetControl - ${currentFamily.name}`, margin, doc.internal.pageSize.height - 5);
        doc.text(`Pagina ${i} din ${totalPages}`, pageWidth - 40, doc.internal.pageSize.height - 5);
      }

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
