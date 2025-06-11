
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceList from "@/components/InvoiceList";

export interface InvoiceItem {
  id: string; // Making sure id is included and required in InvoiceItem
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  accountName: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string;
  totalAmount: number;
  logoUrl?: string;
}

interface InvoicesSectionProps {
  invoices: Invoice[];
  onSaveInvoice: (invoiceData: Invoice) => Promise<void>;
  onDeleteInvoice: (invoiceNumber: string) => Promise<void>;
}

// After checking the actual components, let's update the interfaces to match
// the props accepted by InvoiceForm and InvoiceList
interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  accountName: string; // Required as per the actual component
  amount?: number;
  onSave: (invoiceData: any) => void;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateInvoice: () => void;
  onDeleteInvoice?: (invoiceNumber: string) => Promise<void>;
  onDownloadPDF?: () => void;
}

const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  invoices,
  onSaveInvoice,
  onDeleteInvoice,
}) => {
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);

  const handleOpenInvoiceForm = () => {
    setInvoiceFormOpen(true);
  };
  
  // Get active account name from invoices or use default
  const getActiveAccountName = () => {
    // Find an active account name in the invoices if available
    if (invoices.length > 0) {
      return invoices[0].accountName;
    }
    return "Default Account"; // Fallback value
  };

  return (
    <div>
      {invoiceFormOpen ? (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Create New Invoice</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setInvoiceFormOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <InvoiceForm
            isOpen={invoiceFormOpen} 
            onClose={() => setInvoiceFormOpen(false)}
            accountName={getActiveAccountName()} // Provide the required accountName prop
            onSave={(invoice) => {
              onSaveInvoice(invoice);
              setInvoiceFormOpen(false);
            }}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Invoices</h2>
            <Button onClick={handleOpenInvoiceForm}>
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <InvoiceList
              invoices={invoices}
              onCreateInvoice={handleOpenInvoiceForm}
              onDeleteInvoice={onDeleteInvoice}
              onDownloadPDF={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesSection;
