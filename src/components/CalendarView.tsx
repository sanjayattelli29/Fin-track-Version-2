import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CreditCard, Trash2, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'toBeCredit' | 'salary' | 'debt' | 'interest';
  id?: string;
}

interface SalaryEntry {
  name: string;
  purpose: string;
  amount: number;
  date: string;
}

interface FullTransaction {
  id: string;
  date: string;
  investment: number;
  earnings: number;
  spending: number;
  toBeCredit: number;
  salary?: number;
  salaryEntries?: SalaryEntry[];
  debt?: number;
  interestRate?: number;
}

interface CalendarViewProps {
  transactions: Transaction[];
  allTransactions: FullTransaction[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  onTransferCredit: (date: string, amount: number) => void;
  onDeleteEntry?: (id: string) => void;
  onMonthChange?: (date: Date) => void;
  onAddSalaryEntry?: (entry: SalaryEntry, transactionId?: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  transactions, 
  onSelectDate, 
  selectedDate,
  onTransferCredit,
  allTransactions,
  onDeleteEntry,
  onMonthChange,
  onAddSalaryEntry
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [selectedTransferDate, setSelectedTransferDate] = useState<string>('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [newSalaryName, setNewSalaryName] = useState('');
  const [newSalaryPurpose, setNewSalaryPurpose] = useState('');
  const [newSalaryAmount, setNewSalaryAmount] = useState('');
  const [selectedSalaryDate, setSelectedSalaryDate] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();

  const currentMonthName = format(new Date(currentYear, currentMonth), 'MMMM');
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const allDays = [...emptyDays, ...days];

  const getTransactionsForDay = (day: number) => {
    if (!day) return [];
    
    const date = new Date(currentYear, currentMonth, day);
    const dateString = format(date, 'yyyy-MM-dd');
    
    return transactions.filter(t => t.date === dateString);
  };

  const getFullTransactionsForDay = (day: number) => {
    if (!day) return [];
    
    const date = new Date(currentYear, currentMonth, day);
    const dateString = format(date, 'yyyy-MM-dd');
    
    return allTransactions.filter(t => t.date === dateString);
  };

  const getDayTotal = (day: number) => {
    const dayTransactions = getTransactionsForDay(day);
    if (dayTransactions.length === 0) return 0;
    
    return dayTransactions.reduce((total, t) => {
      return total + t.amount;
    }, 0);
  };

  const prevMonth = () => {
    let newMonth, newYear;
    
    if (currentMonth === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    } else {
      newMonth = currentMonth - 1;
      newYear = currentYear;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (onMonthChange) {
      const newDate = new Date(newYear, newMonth, 1);
      onMonthChange(newDate);
    }
  };

  const nextMonth = () => {
    let newMonth, newYear;
    
    if (currentMonth === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    } else {
      newMonth = currentMonth + 1;
      newYear = currentYear;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (onMonthChange) {
      const newDate = new Date(newYear, newMonth, 1);
      onMonthChange(newDate);
    }
  };

  const handleDateClick = (day: number | null) => {
    if (day === null) return;
    
    const newSelectedDate = new Date(currentYear, currentMonth, day);
    onSelectDate(newSelectedDate);
  };

  const isSelectedDate = (day: number | null) => {
    if (day === null) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const openTransferDialog = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const transactions = getFullTransactionsForDay(day);
    if (transactions.length > 0) {
      const transaction = transactions.find(t => t.toBeCredit > 0);
      if (transaction) {
        setSelectedTransferDate(transaction.date);
        setTransferAmount(transaction.toBeCredit.toString());
      }
    }
  };

  const openSalaryEntryDialog = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const date = new Date(currentYear, currentMonth, day);
    const dateString = format(date, 'yyyy-MM-dd');
    setSelectedSalaryDate(dateString);
    
    const transactions = getFullTransactionsForDay(day);
    if (transactions.length > 0) {
      setSelectedTransactionId(transactions[0].id);
    } else {
      setSelectedTransactionId(undefined);
    }
    
    setNewSalaryName('');
    setNewSalaryPurpose('');
    setNewSalaryAmount('');
  };

  const handleTransferSubmit = () => {
    if (selectedTransferDate && transferAmount) {
      onTransferCredit(selectedTransferDate, Number(transferAmount));
    }
  };
  
  const handleSalaryEntrySubmit = () => {
    if (selectedSalaryDate && newSalaryName && newSalaryAmount && onAddSalaryEntry) {
      const entry: SalaryEntry = {
        name: newSalaryName,
        purpose: newSalaryPurpose,
        amount: Number(newSalaryAmount),
        date: selectedSalaryDate
      };
      
      onAddSalaryEntry(entry, selectedTransactionId);
      
      toast({
        title: "Salary entry added",
        description: `New salary entry for ${newSalaryName} has been added.`
      });
      
      setNewSalaryName('');
      setNewSalaryPurpose('');
      setNewSalaryAmount('');
    }
  };

  const handleDeleteEntry = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const transactions = getFullTransactionsForDay(day);
    if (transactions.length > 0 && onDeleteEntry) {
      onDeleteEntry(transactions[0].id);
      toast({
        title: "Entry deleted",
        description: "All entries for this date have been removed successfully."
      });
    }
  };

  const getTypeColor = (type: 'income' | 'expense' | 'toBeCredit' | 'investment' | 'earnings' | 'spending' | 'salary' | 'debt' | 'interest') => {
    switch (type) {
      case 'income':
      case 'earnings':
        return 'text-green-500';
      case 'expense': 
      case 'investment':
        return 'text-red-500';
      case 'spending':
        return 'text-orange-500';
      case 'toBeCredit':
        return 'text-purple-500';
      case 'salary':
        return 'text-blue-500';
      case 'debt':
        return 'text-yellow-500';
      case 'interest':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    setCurrentMonth(newMonth);
    
    if (onMonthChange) {
      const newDate = new Date(currentYear, newMonth, 1);
      onMonthChange(newDate);
    }
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    setCurrentYear(newYear);
    
    if (onMonthChange) {
      const newDate = new Date(newYear, currentMonth, 1);
      onMonthChange(newDate);
    }
  };

  const getSalaryEntries = (transaction: FullTransaction) => {
    return transaction.salaryEntries || [];
  };

  return (
    <div className="glass-card rounded-xl p-5 mb-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-xl font-semibold mb-4">Calendar View</h3>
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(2000, i, 1), 'MMMM')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="calendar-grid mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {allDays.map((day, index) => {
          const fullTransactions = day ? getFullTransactionsForDay(day) : [];
          const hasTransactions = fullTransactions.length > 0;
          const hasToBeCredit = fullTransactions.some(t => t.toBeCredit > 0);
          const hasSalary = fullTransactions.some(t => t.salary && t.salary > 0);
          const isHovered = hoveredDay === day;

          return (
            <div
              key={index}
              className={`calendar-day-new ${isSelectedDate(day) ? 'calendar-selected' : ''} ${day ? 'cursor-pointer border border-gray-700 rounded-md' : 'opacity-0 pointer-events-none'}`}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {day && (
                <>
                  <div className="flex justify-between w-full">
                    <span className="text-sm">{day}</span>
                    
                    {isHovered && hasTransactions && (
                      <button
                        className="text-red-500 hover:text-red-700 focus:outline-none transition-opacity duration-200"
                        onClick={(e) => handleDeleteEntry(day, e)}
                        title="Delete all entries for this date"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1 w-full">
                    {fullTransactions.length > 0 && fullTransactions.map((transaction) => (
                      <React.Fragment key={transaction.id}>
                        {transaction.investment > 0 && (
                          <span className={`text-xs px-1 rounded ${getTypeColor('investment')}`}>
                            {formatCurrency(transaction.investment)}
                          </span>
                        )}
                        {transaction.earnings > 0 && (
                          <span className={`text-xs px-1 rounded ${getTypeColor('earnings')}`}>
                            {formatCurrency(transaction.earnings)}
                          </span>
                        )}
                        {transaction.spending > 0 && (
                          <span className={`text-xs px-1 rounded ${getTypeColor('spending')}`}>
                            {formatCurrency(transaction.spending)}
                          </span>
                        )}
                        {transaction.toBeCredit > 0 && (
                          <span className={`text-xs px-1 rounded ${getTypeColor('toBeCredit')}`}>
                            {formatCurrency(transaction.toBeCredit)}
                          </span>
                        )}
                        {transaction.salary && transaction.salary > 0 && (
                          <div className="flex items-center">
                            <span className={`text-xs px-1 rounded ${getTypeColor('salary')}`}>
                              {formatCurrency(transaction.salary)}
                            </span>
                            
                            {transaction.salaryEntries && transaction.salaryEntries.length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-blue-500 ml-1">
                                    <Info className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <div className="p-4">
                                    <h4 className="text-sm font-medium mb-2">Salary Entries</h4>
                                    <div className="max-h-64 overflow-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-10">#</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {getSalaryEntries(transaction).map((entry, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell>{idx + 1}</TableCell>
                                              <TableCell>{entry.name}</TableCell>
                                              <TableCell>{entry.purpose}</TableCell>
                                              <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                      <div className="flex justify-between">
                                        <span className="font-medium">Total:</span>
                                        <span className="font-medium">{formatCurrency(transaction.salary || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {hasToBeCredit && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            className="text-xs text-purple-500 hover:underline focus:outline-none"
                            onClick={(e) => openTransferDialog(day, e)}
                          >
                            <CreditCard className="h-3 w-3 inline mr-1" />
                            Transfer
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Transfer Credit to Earnings</DialogTitle>
                            <DialogDescription>
                              Transfer pending credit amount to your earnings.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="date" className="text-right">
                                Date
                              </Label>
                              <Input
                                id="date"
                                value={selectedTransferDate}
                                className="col-span-3"
                                readOnly
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="amount" className="text-right">
                                Amount
                              </Label>
                              <Input
                                id="amount"
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={handleTransferSubmit}>Transfer</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
