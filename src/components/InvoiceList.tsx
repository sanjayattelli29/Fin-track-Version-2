import React, { useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Trash2, 
  Share2,
  Mail,
  Plus,
  CalendarIcon,
  UserIcon,
  BuildingIcon
} from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  id: string; // Adding id to match the expected type
}

interface Invoice {
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

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateInvoice: () => void;
  onDeleteInvoice: (invoiceNumber: string) => Promise<void>;
  onDownloadPDF?: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onCreateInvoice, onDeleteInvoice, onDownloadPDF }) => {
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  
  // Get unique account names
  const accountNames = ["all", ...Array.from(new Set(invoices.map(inv => inv.accountName)))];
  
  // Filter invoices by selected account
  const filteredInvoices = selectedAccount === "all" 
    ? invoices 
    : invoices.filter(inv => inv.accountName === selectedAccount);

  const handleDownload = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
      toast({
        title: "Invoice downloaded",
        description: `Invoice ${invoice.invoiceNumber} has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the invoice.",
        variant: "destructive"
      });
    }
  };

  const handleView = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice, true); // true means preview mode
      toast({
        title: "Invoice previewed",
        description: `Invoice ${invoice.invoiceNumber} is being displayed.`
      });
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Failed to preview the invoice.",
        variant: "destructive"
      });
    }
  };
  
  const confirmDelete = (invoiceNumber: string) => {
    setInvoiceToDelete(invoiceNumber);
    setIsDeleteDialogOpen(true);
  };
  
  const handleShare = async (invoice: Invoice) => {
    // Implement share functionality
    try {
      // Create a navigatorShare object for Web Share API
      if (navigator.share) {
        const pdfBlob = await generateInvoicePDF(invoice);
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice for ${invoice.clientName} - ${formatCurrency(invoice.totalAmount)}`,
          url: window.location.href,
        });
        toast({
          title: "Invoice shared",
          description: "Invoice has been shared successfully."
        });
      } else {
        // Fallback if Web Share API is not available
        toast({
          title: "Share not available",
          description: "Sharing is not supported on this device or browser.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share the invoice.",
        variant: "destructive"
      });
    }
  };
  
  const showInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailView(true);
  };
  
  const closeDetailView = () => {
    setIsDetailView(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = () => {
    if (invoiceToDelete) {
      onDeleteInvoice(invoiceToDelete);
      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoiceToDelete} has been deleted.`
      });
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">My Invoices</h2>
          <p className="text-muted-foreground text-sm">Manage your invoice history</p>
        </div>
        <Button onClick={onCreateInvoice} variant="default">
          <Plus className="h-4 w-4 mr-2" /> Create Invoice
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 pb-4">
        <div className="flex items-center bg-muted/30 rounded-lg p-2">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm font-medium mr-2">Account:</span>
          <div className="flex flex-wrap gap-1">
            {accountNames.map((name) => (
              <Badge
                key={name}
                variant={selectedAccount === name ? "default" : "outline"}
                className={`cursor-pointer hover:opacity-80 ${selectedAccount === name ? "" : "hover:bg-muted"}`}
                onClick={() => setSelectedAccount(name)}
              >
                {name === "all" ? "All Accounts" : name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card className="bg-muted/20 border border-dashed">
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg font-medium mb-2">No invoices found</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              {selectedAccount === "all" 
                ? "You haven't created any invoices yet."
                : `No invoices found for ${selectedAccount}.`}
            </CardDescription>
            <Button onClick={onCreateInvoice}>
              <Plus className="h-4 w-4 mr-2" /> Create your first invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.invoiceNumber} className="overflow-hidden border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => showInvoiceDetails(invoice)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center">
                      Invoice #{invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <CalendarIcon className="h-3 w-3 mr-1" /> 
                      {new Date(invoice.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge>{invoice.accountName}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-start space-x-2 mb-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">{invoice.clientName}</div>
                </div>
                <div className="text-lg font-bold">{formatCurrency(invoice.totalAmount)}</div>
              </CardContent>
              <CardFooter className="pt-0 border-t bg-muted/20">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-muted-foreground">{invoice.items.length} items</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(invoice);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(invoice);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(invoice.invoiceNumber);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(invoice);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailView} onOpenChange={closeDetailView}>
        {selectedInvoice && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Invoice #{selectedInvoice.invoiceNumber}</span>
                <Badge>{selectedInvoice.accountName}</Badge>
              </DialogTitle>
              <DialogDescription>
                Issued on {new Date(selectedInvoice.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bill To:</h3>
                <p className="font-medium">{selectedInvoice.clientName}</p>
                <p className="text-sm">{selectedInvoice.clientEmail}</p>
                <p className="text-sm">{selectedInvoice.clientAddress}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Amount:</h3>
                <p className="text-xl font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                <p className="text-sm">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {selectedInvoice.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
              </div>
            )}
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleView(selectedInvoice)}>
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare(selectedInvoice)}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
              <Button variant="destructive" size="sm" onClick={() => {
                confirmDelete(selectedInvoice.invoiceNumber);
                closeDetailView();
              }}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteInvoice}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceList;
