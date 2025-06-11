import React from 'react';
import { ArrowDown, ArrowUp, CreditCard, CreditCard as CreditCardIcon, Briefcase, Info, Wallet, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Pencil, Trash, FileDown } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { SalaryEntry, SummaryData } from '@/hooks/transactions/types';

interface SummaryCardsProps {
  data: SummaryData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const [showSalaryDetails, setShowSalaryDetails] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [currentEntries, setCurrentEntries] = React.useState<SalaryEntry[]>([]);
  const [editEntry, setEditEntry] = React.useState<SalaryEntry | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPurpose, setEditPurpose] = React.useState("");
  const [editAmount, setEditAmount] = React.useState("");
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (data.salaryEntries) {
      const monthYearStr = format(selectedMonth, 'yyyy-MM');
      const filteredEntries = data.salaryEntries.filter(entry => 
        entry.date.startsWith(monthYearStr)
      );
      setCurrentEntries(filteredEntries);
    } else {
      setCurrentEntries([]);
    }
  }, [data.salaryEntries, selectedMonth]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handleEditClick = (entry: SalaryEntry) => {
    setEditEntry(entry);
    setEditName(entry.name);
    setEditPurpose(entry.purpose || '');
    setEditAmount(entry.amount.toString());
  };

  const handleSaveEdit = () => {
    toast({
      title: "Feature not implemented",
      description: "Editing salary entries will be available in the next update.",
    });
    setEditEntry(null);
  };

  const handleDeleteClick = (entry: SalaryEntry) => {
    toast({
      title: "Feature not implemented",
      description: "Deleting salary entries will be available in the next update.",
    });
  };

  const handleExportCSV = () => {
    if (currentEntries.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no salary entries for the selected month.",
      });
      return;
    }
    
    const headers = ['Name', 'Date', 'Purpose', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...currentEntries.map(entry => [
        entry.name,
        entry.date,
        entry.purpose || '',
        entry.amount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `salary_entries_${format(selectedMonth, 'MMM_yyyy')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your salary entries have been exported as CSV."
    });
  };

  // Calculate total expenses including salary
  const totalExpenses = data.expenses + data.salary;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Remaining</p>
              <h3 className={cn(
                "text-2xl font-bold mt-1",
                data.remaining < 0 ? "text-finance-red" : "text-white"
              )}>
                {formatCurrency(data.remaining)}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Monthly balance
              </p>
            </div>
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div 
          className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Income</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(data.income)}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Monthly earnings
              </p>
            </div>
            <div className="bg-green-500/20 p-2 rounded-lg">
              <ArrowUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        <div 
          className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Expenses</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(totalExpenses)}
              </h3>
              <p className="text-xs text-finance-red flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Monthly outflow
              </p>
            </div>
            <div className="bg-red-500/20 p-2 rounded-lg">
              <ArrowDown className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>

        <div 
          className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">To Be Credited</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(data.toBeCredit)}
              </h3>
              <p className="text-xs text-purple-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Pending credits
              </p>
            </div>
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <CreditCardIcon className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </div>
      
        <div 
          className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up relative"
          style={{ animationDelay: '350ms' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400">Salary</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {formatCurrency(data.salary)}
              </h3>
              <p className="text-xs text-blue-500 flex items-center mt-1">
                <span className="inline-block mr-1">●</span> Monthly income
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-blue-500/20 h-9 w-9 p-0" 
                onClick={() => setShowSalaryDetails(true)}
              >
                <Info className="h-5 w-5 text-blue-500" />
              </Button>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Debt and Interest (only shown if enabled) */}
      {data.showDebt && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Debt</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatCurrency(data.debt || 0)}
                </h3>
                <p className="text-xs text-yellow-500 flex items-center mt-1">
                  <span className="inline-block mr-1">●</span> Remaining principal
                </p>
              </div>
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </div>

          <div 
            className="glass-card rounded-xl p-5 transition-all duration-300 animate-fade-up"
            style={{ animationDelay: '450ms' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400">Monthly Interest</p>
                <h3 className="text-2xl font-bold mt-1 text-white">
                  {formatCurrency(data.interest || 0)}
                </h3>
                <p className="text-xs text-orange-500 flex items-center mt-1">
                  <span className="inline-block mr-1">●</span> Part of expenses
                </p>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Percent className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Details Dialog */}
      <Dialog open={showSalaryDetails} onOpenChange={setShowSalaryDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Salary Entries</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">
                  {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" /> Export as CSV
              </Button>
            </div>
            
            {currentEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEntries.map((entry, idx) => (
                      <TableRow key={entry.id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {editEntry === entry ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            />
                          ) : entry.name}
                        </TableCell>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          {editEntry === entry ? (
                            <input
                              type="text"
                              value={editPurpose}
                              onChange={(e) => setEditPurpose(e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            />
                          ) : entry.purpose || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {editEntry === entry ? (
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full border rounded px-2 py-1 text-right"
                            />
                          ) : (
                            <span className="font-medium text-blue-400">
                              {formatCurrency(entry.amount)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {editEntry === entry ? (
                              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditClick(entry)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(entry)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-medium">
                      <TableCell colSpan={4} className="text-right">Total</TableCell>
                      <TableCell className="text-right text-blue-500">
                        {formatCurrency(
                          currentEntries.reduce((sum, entry) => sum + entry.amount, 0)
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No salary entries found for {format(selectedMonth, 'MMMM yyyy')}.</p>
                <p className="mt-2">Add salary entries from the calendar view by clicking on a date.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SummaryCards;
