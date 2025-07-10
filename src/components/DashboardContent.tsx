
import React from 'react';
import { format } from 'date-fns';
import SummaryCards from '@/components/SummaryCards';
import CalendarView from '@/components/CalendarView';
import EntryForm from '@/components/EntryForm';
import FinancialOverview from '@/components/FinancialOverview';
import MonthlyOverview from '@/components/MonthlyOverview';
import YearlyAnalysis from '@/components/YearlyAnalysis';
import { useIsMobile } from '@/hooks/use-mobile';
import AllAccountsAnalysis from '@/components/AllAccountsAnalysis';
import { Transaction, SummaryData, SalaryEntry, CalendarTransaction, Account, DebtEntry } from '@/hooks/transactions/types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';

// Local type to match EntryForm's expectations
interface EntryFormDebtEntry {
  principal: number;
  interestRate: number;
  date: string;
}

interface DashboardContentProps {
  showAllAccountsAnalysis: boolean;
  summaryData: SummaryData;
  selectedDate: Date;
  calendarTransactions: CalendarTransaction[];
  transactions: Transaction[];
  defaultCommission: number;
  defaultTax: number;
  defaultValues?: Transaction;
  showDebtFields: boolean;
  onSelectDate: (date: Date) => void;
  onSaveEntry: (entry: any) => void;
  onDeleteEntry: (id: string) => void;
  onTransferCredit: (date: string, amount: number) => void;
  onMonthChange: (date: Date) => void;
  onAddSalaryEntry: (entry: SalaryEntry, transactionId?: string) => void;
  onAddDebtEntry: (entry: { amount: number; interestRate: number; date: string }) => void;
  onSaveDefaults: (commission: number, tax: number) => void;
  onExport: () => void;
  accountTransactions: Record<string, Transaction[]>;
  accounts: Account[];
  onSendEmail: () => Promise<void>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  showAllAccountsAnalysis,
  summaryData,
  selectedDate,
  calendarTransactions,
  transactions,
  defaultCommission,
  defaultTax,
  defaultValues,
  showDebtFields,
  onSelectDate,
  onSaveEntry,
  onDeleteEntry,
  onTransferCredit,
  onMonthChange,
  onAddSalaryEntry,
  onAddDebtEntry,
  onSaveDefaults,
  onExport,
  accountTransactions,
  accounts,
  onSendEmail
}) => {
  const isMobile = useIsMobile();
  
  // Find the active account to display its number
  const activeAccount = accounts.find(account => account.isActive);

  // Calculate Whole Deposits for the active account
  const wholeDeposits = React.useMemo(() => {
    if (!activeAccount) return 0;
    return transactions
      .filter(tx => tx.account_id === activeAccount.id)
      .reduce((sum, tx) => sum + (tx.earnings || 0) + (tx.salary || 0), 0);
  }, [transactions, activeAccount]);
  
  // Convert EntryForm's debt entry format to the expected format
  const handleAddDebtEntryForForm = (entry: EntryFormDebtEntry) => {
    onAddDebtEntry({
      amount: entry.principal,
      interestRate: entry.interestRate,
      date: format(selectedDate, 'yyyy-MM-dd')
    });
  };
  
  if (showAllAccountsAnalysis) {
    return (
      <AllAccountsAnalysis 
        accountTransactions={accountTransactions}
        accounts={accounts}
        onSendEmail={onSendEmail}
      />
    );
  }
  
  return (
    <>
      {activeAccount && activeAccount.accountNumber && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="text-sm font-medium">
              Account #{activeAccount.accountNumber}
            </Badge>
            <span className="ml-2 text-sm text-muted-foreground">
              {activeAccount.name}
            </span>
            {/* Whole Deposits Showcase */}
            <div className="ml-4 px-3 py-1 rounded-lg bg-green-100 text-green-800 font-semibold text-sm shadow">
              Whole Deposits: {formatCurrency(wholeDeposits)}
            </div>
          </div>
          <Link 
            to="/switch-accounts" 
            className="text-sm text-primary hover:text-primary/80 hover:underline"
          >
            Switch Account
          </Link>
        </div>
      )}
      
      <SummaryCards data={summaryData} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2">
          <CalendarView 
            transactions={calendarTransactions} 
            onSelectDate={onSelectDate}
            selectedDate={selectedDate}
            onTransferCredit={onTransferCredit}
            allTransactions={transactions}
            onDeleteEntry={onDeleteEntry}
            onMonthChange={onMonthChange}
            onAddSalaryEntry={onAddSalaryEntry}
          />
          
          {isMobile && (
            <EntryForm 
              selectedDate={selectedDate}
              onSave={onSaveEntry}
              defaultCommission={defaultCommission}
              defaultTax={defaultTax}
              onSaveDefaults={onSaveDefaults}
              defaultValues={defaultValues}
              onAddSalaryEntry={onAddSalaryEntry}
              onAddDebtEntry={handleAddDebtEntryForForm}
              showDebtFields={showDebtFields}
            />
          )}
          
          <FinancialOverview transactions={calendarTransactions} />
          <YearlyAnalysis 
            transactions={transactions} 
            onExport={onExport}
          />
        </div>
        
        <div>
          {!isMobile && (
            <EntryForm 
              selectedDate={selectedDate}
              onSave={onSaveEntry}
              defaultCommission={defaultCommission}
              defaultTax={defaultTax}
              onSaveDefaults={onSaveDefaults}
              defaultValues={defaultValues}
              onAddSalaryEntry={onAddSalaryEntry}
              onAddDebtEntry={handleAddDebtEntryForForm}
              showDebtFields={showDebtFields}
            />
          )}
          <MonthlyOverview 
            transactions={transactions} 
            onExport={onExport}
          />
        </div>
      </div>
    </>
  );
};

export default DashboardContent;
