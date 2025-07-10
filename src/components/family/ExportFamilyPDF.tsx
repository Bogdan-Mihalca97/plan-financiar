
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const ExportFamilyPDF = () => {
  const { currentFamily, familyMembers, familyInvitations } = useFamily();
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
      doc.text('Raport Familie - BugetControl', 20, yPosition);
      yPosition += 20;

      // Family name
      doc.setFontSize(16);
      doc.text(`Familie: ${currentFamily.name}`, 20, yPosition);
      yPosition += 15;

      // Creation date
      doc.setFontSize(12);
      doc.text(`Creată la: ${new Date(currentFamily.created_at).toLocaleDateString('ro-RO')}`, 20, yPosition);
      yPosition += 20;

      // Members section
      doc.setFontSize(14);
      doc.text('Membri Familie:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      familyMembers.forEach((member, index) => {
        const memberName = member.first_name && member.last_name 
          ? `${member.first_name} ${member.last_name}`
          : member.email || 'Nume necunoscut';
        
        const roleText = member.role === 'admin' ? 'Administrator' : 'Membru';
        const joinedDate = new Date(member.joined_at).toLocaleDateString('ro-RO');
        
        doc.text(`${index + 1}. ${memberName}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Rol: ${roleText}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Alăturat la: ${joinedDate}`, 25, yPosition);
        yPosition += 8;

        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Invitations section
      if (familyInvitations.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Invitații în Așteptare:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        familyInvitations.forEach((invitation, index) => {
          const invitedDate = new Date(invitation.created_at).toLocaleDateString('ro-RO');
          
          doc.text(`${index + 1}. ${invitation.email}`, 25, yPosition);
          yPosition += 5;
          doc.text(`   Trimisă la: ${invitedDate}`, 25, yPosition);
          yPosition += 8;

          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }

      // Statistics section
      yPosition += 15;
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Statistici Familie:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.text(`Total membri: ${familyMembers.length}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Invitații în așteptare: ${familyInvitations.length}`, 25, yPosition);
      yPosition += 6;

      const adminCount = familyMembers.filter(m => m.role === 'admin').length;
      doc.text(`Administratori: ${adminCount}`, 25, yPosition);
      yPosition += 6;

      // Footer
      yPosition += 20;
      doc.setFontSize(8);
      doc.text(`Generat la: ${new Date().toLocaleString('ro-RO')}`, 20, yPosition);
      doc.text('BugetControl - Gestionarea bugetului familiei', 20, yPosition + 5);

      // Save the PDF
      const fileName = `Familie_${currentFamily.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Export Reușit",
        description: "Raportul familiei a fost descărcat cu succes",
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
          Export PDF
        </>
      )}
    </Button>
  );
};

export default ExportFamilyPDF;
