
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDown, ArrowUp, Calculator, ChevronDown, Clock9, Percent, Plus, Trash2, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from '@/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SalaryEntry {
  id: string;
  name: string;
  purpose: string;
  amount: number;
  date: string;
}

interface DebtEntry {
  principal: number;
  interestRate: number;
  date: string;
}

interface EntryFormProps {
  selectedDate: Date;
  onSave: (data: {
    date: string;
    investment: number;
    earnings: number;
    spending: number;
    toBeCredit: number;
    salary: number;
    debt?: number;
    interestRate?: number;
  }) => void;
  defaultCommission: number;
  defaultTax: number;
  onSaveDefaults: (commission: number, tax: number) => void;
  defaultValues?: {
    investment: number;
    earnings: number;
    spending: number;
    toBeCredit: number;
    salary?: number;
    debt?: number;
    interestRate?: number;
  };
  onAddSalaryEntry: (entry: SalaryEntry) => void;
  onAddDebtEntry?: (entry: DebtEntry) => void;
  onDeleteSalaryEntry?: (id: string) => void;
  salaryEntries?: SalaryEntry[];
  showDebtFields?: boolean;
}

const EntryForm: React.FC<EntryFormProps> = ({
  selectedDate,
  onSave,
  defaultCommission,
  defaultTax,
  onSaveDefaults,
  defaultValues,
  onAddSalaryEntry,
  onAddDebtEntry,
  onDeleteSalaryEntry,
  salaryEntries = [],
  showDebtFields = false
}) => {
  const [investment, setInvestment] = useState('0');
  const [grossEarnings, setGrossEarnings] = useState('0');
  const [netEarnings, setNetEarnings] = useState('0');
  const [spending, setSpending] = useState('0');
  const [toBeCredit, setToBeCredit] = useState('0');
  const [salary, setSalary] = useState('0');
  const [commission, setCommission] = useState(defaultCommission.toString());
  const [tax, setTax] = useState(defaultTax.toString());
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salaryName, setSalaryName] = useState('');
  const [salaryPurpose, setSalaryPurpose] = useState('');
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [debtPrincipal, setDebtPrincipal] = useState('0');
  const [interestRate, setInterestRate] = useState('0');
  const [entryType, setEntryType] = useState<'finance'|'salary'|'debt'>('finance');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [viewSalaryEntries, setViewSalaryEntries] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setInvestment(defaultValues.investment.toString());
      setGrossEarnings(defaultValues.earnings.toString());
      setNetEarnings(calculateNetEarnings(defaultValues.earnings).toString());
      setSpending(defaultValues.spending.toString());
      setToBeCredit(defaultValues.toBeCredit.toString());
      setSalary(defaultValues.salary?.toString() || '0');
      
      if (showDebtFields) {
        setDebtPrincipal(defaultValues.debt?.toString() || '0');
        setInterestRate(defaultValues.interestRate?.toString() || '0');
      }
    } else {
      setInvestment('0');
      setGrossEarnings('0');
      setNetEarnings('0');
      setSpending('0');
      setToBeCredit('0');
      setSalary('0');
      
      if (showDebtFields) {
        setDebtPrincipal('0');
        setInterestRate('0');
      }
    }
  }, [defaultValues, showDebtFields]);

  const calculateNetEarnings = (grossValue: number) => {
    const commissionRate = parseFloat(commission) / 100;
    const taxRate = parseFloat(tax) / 100;
    
    const commissionDeduction = grossValue * commissionRate;
    const taxDeduction = grossValue * taxRate;
    
    return grossValue - commissionDeduction - taxDeduction;
  };

  const calculateMonthlyInterest = () => {
    const principal = parseFloat(debtPrincipal) || 0;
    const rate = parseFloat(interestRate) || 0;
    return (principal * rate) / 1200; // Convert annual rate to monthly
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleSave = () => {
    const investmentValue = parseFloat(investment) || 0;
    // Use netEarnings instead of grossEarnings
    const earningsValue = parseFloat(netEarnings) || 0;
    const spendingValue = parseFloat(spending) || 0;
    const toBeCreditValue = parseFloat(toBeCredit) || 0;
    const salaryValue = parseFloat(salary) || 0;
    
    let debtValue: number | undefined = undefined;
    let interestRateValue: number | undefined = undefined;
    
    if (showDebtFields) {
      debtValue = parseFloat(debtPrincipal) || 0;
      interestRateValue = parseFloat(interestRate) || 0;
    }
    
    onSave({
      date: format(selectedDate, 'yyyy-MM-dd'),
      investment: investmentValue,
      earnings: earningsValue,
      spending: spendingValue,
      toBeCredit: toBeCreditValue,
      salary: salaryValue,
      debt: debtValue,
      interestRate: interestRateValue
    });

    setInvestment('0');
    setGrossEarnings('0');
    setNetEarnings('0');
    setSpending('0');
    setToBeCredit('0');
    setSalary('0');
    
    if (showDebtFields) {
      setDebtPrincipal('0');
      setInterestRate('0');
    }
  };

  const handleAddSalary = () => {
    const salaryValue = parseFloat(salary);
    
    if (salaryValue > 0 && salaryName) {
      const entry: SalaryEntry = {
        id: uuidv4(), // Generate a unique ID for each entry
        name: salaryName,
        purpose: salaryPurpose,
        amount: salaryValue,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      
      onAddSalaryEntry(entry);
      
      setSalary('0');
      setSalaryName('');
      setSalaryPurpose('');
      setIsSalaryDialogOpen(false);
    }
  };

  const handleAddDebt = () => {
    if (!onAddDebtEntry || !showDebtFields) return;
    
    const principalValue = parseFloat(debtPrincipal);
    const rateValue = parseFloat(interestRate);
    
    if (principalValue > 0) {
      const entry: DebtEntry = {
        principal: principalValue,
        interestRate: rateValue || 0,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      
      onAddDebtEntry(entry);
      
      setDebtPrincipal('0');
      setInterestRate('0');
      setIsDebtDialogOpen(false);
    }
  };

  const handleDeleteSalary = () => {
    if (onDeleteSalaryEntry && selectedEntryId) {
      onDeleteSalaryEntry(selectedEntryId);
      setIsDeleteDialogOpen(false);
      setSelectedEntryId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedEntryId(id);
    setIsDeleteDialogOpen(true);
  };

  const currentMonthEntries = salaryEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === selectedDate.getMonth() && 
           entryDate.getFullYear() === selectedDate.getFullYear();
  });

  const totalSalary = currentMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="glass-card border border-[#1e293b] animate-fade-up" style={{ animationDelay: '400ms' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>New Entry for {format(selectedDate, 'MMM d, yyyy')}</CardTitle>
        </div>
        <CardDescription>
          Record your financial activity for the selected date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={entryType} onValueChange={(v) => setEntryType(v as 'finance'|'salary'|'debt')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
            {showDebtFields && <TabsTrigger value="debt">Debt</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="finance">
            <div className="space-y-4">
              <div>
                <Label 
                  htmlFor="investment" 
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  Investment (INR)
                </Label>
                <Input
                  id="investment"
                  type="number"
                  min="0"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label 
                    htmlFor="grossEarnings"
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    Gross Earnings (INR)
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="h-6 px-2 text-xs gap-1"
                  >
                    <Calculator className="h-3 w-3" />
                    Calculator
                  </Button>
                </div>
                <Input
                  id="grossEarnings"
                  type="number"
                  min="0"
                  value={grossEarnings}
                  onChange={(e) => {
                    setGrossEarnings(e.target.value);
                    setNetEarnings(calculateNetEarnings(parseFloat(e.target.value) || 0).toString());
                  }}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium"
                />
                
                {showCalculator && (
                  <div className="p-2 border rounded-md mt-2 bg-background/10">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <Label htmlFor="commission" className="text-xs">Commission (%)</Label>
                        <Input
                          id="commission"
                          type="number"
                          min="0"
                          value={commission}
                          onChange={(e) => {
                            setCommission(e.target.value);
                            setNetEarnings(calculateNetEarnings(parseFloat(grossEarnings) || 0).toString());
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax" className="text-xs">Tax (%)</Label>
                        <Input
                          id="tax"
                          type="number"
                          min="0"
                          value={tax}
                          onChange={(e) => {
                            setTax(e.target.value);
                            setNetEarnings(calculateNetEarnings(parseFloat(grossEarnings) || 0).toString());
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">Net Earnings:</span>
                      <span className="text-sm font-medium">{formatCurrency(parseFloat(netEarnings) || 0)}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs" 
                      onClick={() => onSaveDefaults(parseFloat(commission), parseFloat(tax))}
                    >
                      Save as Default Rates
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <Label 
                  htmlFor="spending" 
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  Spending (INR)
                </Label>
                <Input
                  id="spending"
                  type="number"
                  min="0"
                  value={spending}
                  onChange={(e) => setSpending(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium"
                />
              </div>
              
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full mt-1" size="sm">
                    <span className="mr-1">{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div>
                    <Label 
                      htmlFor="toBeCredit" 
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <Clock9 className="h-4 w-4 text-purple-500" />
                      To Be Credited Later (INR)
                    </Label>
                    <Input
                      id="toBeCredit"
                      type="number"
                      min="0"
                      value={toBeCredit}
                      onChange={(e) => setToBeCredit(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="text-lg font-medium"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>
          
          <TabsContent value="salary">
            <div className="space-y-4">
              <div>
                <Label 
                  htmlFor="salaryAmount" 
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <ArrowUp className="h-4 w-4 text-blue-500" />
                  Salary Amount (INR)
                </Label>
                <Input
                  id="salaryAmount"
                  type="number"
                  min="0"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => setIsSalaryDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Salary Details
                </Button>
                
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setViewSalaryEntries(true)}
                >
                  View Salary Entries
                </Button>
              </div>
              
              <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Salary Entry</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryName">Received From</Label>
                      <Input
                        id="salaryName"
                        value={salaryName}
                        onChange={(e) => setSalaryName(e.target.value)}
                        placeholder="Company or person name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryPurpose">Purpose (Optional)</Label>
                      <Input
                        id="salaryPurpose"
                        value={salaryPurpose}
                        onChange={(e) => setSalaryPurpose(e.target.value)}
                        placeholder="e.g. Monthly salary, Bonus, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryDialogAmount">Amount (INR)</Label>
                      <Input
                        id="salaryDialogAmount"
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddSalary} disabled={!salaryName || parseFloat(salary) <= 0}>
                      Add Salary Entry
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={viewSalaryEntries} onOpenChange={setViewSalaryEntries}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Salary Entries</DialogTitle>
                    <DialogDescription>
                      {format(selectedDate, 'MMMM yyyy')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="max-h-[60vh] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentMonthEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No salary entries for this month
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentMonthEntries.map((entry, index) => (
                            <TableRow key={entry.id || index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{format(new Date(entry.date), 'd MMM yyyy')}</TableCell>
                              <TableCell>{entry.purpose || '-'}</TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(entry.amount)}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => entry.id && confirmDelete(entry.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      {currentMonthEntries.length > 0 && (
                        <TableHeader>
                          <TableRow>
                            <TableHead colSpan={4} className="text-right font-medium">Total</TableHead>
                            <TableHead className="font-medium">{formatCurrency(totalSalary)}</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                      )}
                    </Table>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewSalaryEntries(false)}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this salary entry? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteSalary}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          {showDebtFields && (
            <TabsContent value="debt">
              <div className="space-y-4">
                <div>
                  <Label 
                    htmlFor="debtPrincipal" 
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4 text-yellow-500" />
                    Debt Principal (INR)
                  </Label>
                  <Input
                    id="debtPrincipal"
                    type="number"
                    min="0"
                    value={debtPrincipal}
                    onChange={(e) => setDebtPrincipal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-medium"
                  />
                </div>
                
                <div>
                  <Label 
                    htmlFor="interestRate" 
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <Percent className="h-4 w-4 text-orange-500" />
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-medium"
                  />
                </div>
                
                {parseFloat(debtPrincipal) > 0 && parseFloat(interestRate) > 0 && (
                  <div className="bg-background/10 p-3 rounded-md mt-2">
                    <p className="text-sm font-medium mb-1">Calculated Monthly Interest</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Based on {formatCurrency(parseFloat(debtPrincipal))} at {parseFloat(interestRate)}% annually
                      </span>
                      <span className="text-sm font-medium text-orange-500">
                        {formatCurrency(calculateMonthlyInterest())}
                      </span>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsDebtDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt Details
                </Button>
                
                <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Debt Entry</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="debtDialogPrincipal">Principal Amount (INR)</Label>
                        <Input
                          id="debtDialogPrincipal"
                          type="number"
                          value={debtPrincipal}
                          onChange={(e) => setDebtPrincipal(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="debtDialogRate">Annual Interest Rate (%)</Label>
                        <Input
                          id="debtDialogRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                        />
                      </div>
                      
                      {parseFloat(debtPrincipal) > 0 && parseFloat(interestRate) > 0 && (
                        <div className="bg-background/10 p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Monthly Interest</p>
                          <p className="text-sm text-orange-500 font-medium">
                            {formatCurrency(calculateMonthlyInterest())} per month
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAddDebt} disabled={parseFloat(debtPrincipal) <= 0}>
                        Add Debt Entry
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="default" onClick={handleSave}>
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EntryForm;
