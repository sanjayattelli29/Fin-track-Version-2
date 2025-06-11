
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './format';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface SummaryData {
  remaining: number;
  income: number;
  expenses: number;
  toBeCredit: number;
  salary: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  accountName: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  notes: string;
  totalAmount: number;
  logoUrl?: string;
}

export const exportToPDF = (title: string, tableData: TableData, summaryData: SummaryData) => {
  const { headers, rows } = tableData;
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add summary section
  doc.setFontSize(12);
  doc.text("Summary", 14, 40);
  
  doc.setFontSize(10);
  doc.text(`Remaining: ${formatCurrency(summaryData.remaining)}`, 14, 50);
  doc.text(`Income: ${formatCurrency(summaryData.income)}`, 14, 56);
  doc.text(`Expenses: ${formatCurrency(summaryData.expenses)}`, 14, 62);
  doc.text(`To Be Credited: ${formatCurrency(summaryData.toBeCredit)}`, 14, 68);
  doc.text(`Salary: ${formatCurrency(summaryData.salary)}`, 14, 74);
  
  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 80,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 80 },
  });
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

export const generateInvoicePDF = async (invoiceData: InvoiceData, preview: boolean = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  
  // Set background color for the footer
  doc.setFillColor(227, 202, 123); // Gold color for footer like in the image
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  // Add logo if available
  if (invoiceData.logoUrl) {
    try {
      // Convert logo URL to data URL to work with CORS restrictions
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = invoiceData.logoUrl;
      });
      
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Get data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Add logo to PDF
      doc.addImage(dataUrl, 'PNG', margin, yPos, 40, 40);
      
      // Add company name and slogan next to the logo
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Financial Manager", margin + 45, yPos + 15);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text("Meet All Your Needs", margin + 45, yPos + 25);
    } catch (error) {
      console.error("Error loading logo:", error);
    }
  }
  
  // Add Invoice Title
  doc.setFontSize(36);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", pageWidth - margin - doc.getTextWidth("INVOICE"), yPos + 20);
  
  // Invoice details (right side)
  yPos = 70;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Invoice#", pageWidth - margin - 80, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.invoiceNumber, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFont(undefined, 'bold');
  doc.text("Date", pageWidth - margin - 80, yPos);
  doc.setFont(undefined, 'normal');
  
  // Format date as DD / MM / YYYY
  const invoiceDate = new Date(invoiceData.date);
  const formattedDate = `${String(invoiceDate.getDate()).padStart(2, '0')} / ${String(invoiceDate.getMonth() + 1).padStart(2, '0')} / ${invoiceDate.getFullYear()}`;
  
  doc.text(formattedDate, pageWidth - margin, yPos, { align: 'right' });
  
  // Invoice to (left side)
  yPos = 70;
  doc.setFont(undefined, 'bold');
  doc.text("Invoice to:", margin, yPos);
  
  yPos += 10;
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.clientName, margin, yPos);
  
  yPos += 10;
  // Split address into multiple lines if necessary
  const addressLines = doc.splitTextToSize(invoiceData.clientAddress, 150);
  for (const line of addressLines) {
    doc.text(line, margin, yPos);
    yPos += 7;
  }
  
  // Horizontal Line
  yPos = 110;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // Add invoice table
  yPos += 10;
  
  // Create table data
  const tableData = {
    head: [["Item", "Quantity", "Unit Price", "Total"]],
    body: invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.rate),
      formatCurrency(item.amount)
    ])
  };
  
  // Add table
  autoTable(doc, {
    startY: yPos,
    head: tableData.head,
    body: tableData.body,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 70, halign: 'right' },
      3: { cellWidth: 70, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  // Get the position after the table
  yPos = (doc as any)['lastAutoTable'].finalY + 20;
  
  // Payment information (left side)
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("PAYMENT METHOD", margin, yPos);
  
  yPos += 10;
  doc.setFont(undefined, 'normal');
  doc.text(`Account Name: ${invoiceData.accountName}`, margin, yPos);
  
  // Add subtotal, tax and total (right side)
  yPos = (doc as any)['lastAutoTable'].finalY + 20;
  
  doc.setFont(undefined, 'bold');
  doc.text("Subtotal", pageWidth - margin - 70, yPos);
  doc.text(formatCurrency(invoiceData.totalAmount), pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.text("Tax (0%)", pageWidth - margin - 70, yPos);
  doc.text(formatCurrency(0), pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 15;
  doc.setFontSize(14);
  doc.text("Total", pageWidth - margin - 70, yPos);
  doc.text(formatCurrency(invoiceData.totalAmount), pageWidth - margin, yPos, { align: 'right' });
  
  // Add horizontal line before total
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - margin - 120, yPos - 5, pageWidth - margin, yPos - 5);
  
  // Thank you note
  yPos = pageHeight - 70;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text("Thank you for your business!", margin, yPos);
  
  // Add signature line
  yPos += 10;
  doc.line(pageWidth - margin - 100, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text("Authorized Signed", pageWidth - margin - 50, yPos, { align: 'center' });
  
  // Add footer with contact info
  const footerY = pageHeight - 20;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Phone: " + (invoiceData.clientEmail || ""), pageWidth / 4, footerY, { align: 'center' });
  doc.text("Address: " + (invoiceData.clientAddress?.split(',')[0] || ""), (pageWidth / 4) * 3, footerY, { align: 'center' });
  
  // Save or open the PDF
  if (preview) {
    // Open PDF in a new tab
    const pdfOutput = doc.output('datauristring');
    window.open(pdfOutput, '_blank');
  } else {
    // Save the PDF
    const generatedFileName = `invoice_${invoiceData.invoiceNumber.replace(/\//g, '-')}_${invoiceData.accountName.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    doc.save(generatedFileName);
    return generatedFileName;
  }
  
  return preview ? null : `invoice_${invoiceData.invoiceNumber.replace(/\//g, '-')}_${invoiceData.accountName.toLowerCase().replace(/\s+/g, '_')}.pdf`;
};
