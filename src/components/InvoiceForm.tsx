
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/lib/pdf-export';
import { formatCurrency } from '@/lib/format';
import { Plus, Minus, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  accountName: string;
  amount?: number;
  onSave: (invoiceData: any) => void;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  accountName,
  amount = 0,
  onSave
}) => {
  const { toast } = useToast();
  const currentDate = new Date().toISOString().split('T')[0];
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [date, setDate] = useState(currentDate);
  const [dueDate, setDueDate] = useState(nextMonthDate.toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [notes, setNotes] = useState('Thank you for your business.');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: 'Services',
      quantity: 1,
      rate: amount,
      amount: amount
    }
  ]);

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item",
        variant: "destructive"
      });
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (!clientName || !clientEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const invoiceData = {
      invoiceNumber,
      date,
      dueDate,
      accountName,
      clientName,
      clientEmail,
      clientAddress,
      items,
      notes,
      totalAmount,
      logoUrl: 'https://mrobxkdouyxxhwnxespt.supabase.co/storage/v1/object/sign/logo/logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJsb2dvL2xvZ28ucG5nIiwiaWF0IjoxNzQzNTc0NDcyLCJleHAiOjMzMjAzNzQ0NzJ9.MVfnVLbF0_mREieEqu_pFXjhuqnGFyxdxlbBW2uMt0M'
    };

    try {
      onSave(invoiceData);
      await generateInvoicePDF(invoiceData);
      
      toast({
        title: "Invoice created",
        description: "Your invoice has been generated successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "There was an error creating your invoice. Please try again.",
        variant: "destructive"
      });
      console.error("Invoice generation error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate a professional invoice for your client.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left column - Invoice details */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input 
                id="invoiceNumber" 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="accountName">From Account</Label>
              <Input 
                id="accountName" 
                value={accountName} 
                readOnly 
                className="bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          {/* Right column - Client details */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input 
                id="clientName" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="clientEmail">Client Email *</Label>
              <Input 
                id="clientEmail" 
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea 
                id="clientAddress" 
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Invoice Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-2">
              <div className="col-span-6 font-medium text-sm">Description</div>
              <div className="col-span-1 font-medium text-sm text-right">Qty</div>
              <div className="col-span-2 font-medium text-sm text-right">Rate</div>
              <div className="col-span-2 font-medium text-sm text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Items */}
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Input 
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-1">
                  <Input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    min="1"
                    className="text-right"
                  />
                </div>
                <div className="col-span-2">
                  <Input 
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="text-right"
                  />
                </div>
                <div className="col-span-2">
                  <Input 
                    value={formatCurrency(item.amount)}
                    readOnly
                    className="bg-muted text-right"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Minus className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Total */}
            <div className="grid grid-cols-12 gap-2 pt-4 border-t">
              <div className="col-span-9 text-right font-medium">Total Amount:</div>
              <div className="col-span-2">
                <Input 
                  value={formatCurrency(totalAmount)}
                  readOnly
                  className="bg-muted text-right font-bold"
                />
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" /> Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
