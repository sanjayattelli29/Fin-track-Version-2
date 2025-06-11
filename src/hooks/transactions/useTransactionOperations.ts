
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/format';
import { Account, Transaction, SalaryEntry, DebtEntry } from './types';

export const useTransactionOperations = (
  currentAccount: Account | null,
  accountTransactions: Record<string, Transaction[]>,
  setAccountTransactions: React.Dispatch<React.SetStateAction<Record<string, Transaction[]>>>,
  showDebtFeature: boolean
) => {
  const { toast } = useToast();

  const handleSaveEntry = async (entry: {
    date: string;
    investment: number;
    earnings: number;
    spending: number;
    toBeCredit: number;
    salary: number;
    debt?: number;
    interestRate?: number;
  }) => {
    if (!currentAccount) return;
    
    try {
      const currentAccountId = currentAccount.id;
      
      // Insert new transaction
      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: currentAccountId,
          date: entry.date,
          investment: entry.investment,
          earnings: entry.earnings,
          spending: entry.spending,
          to_be_credit: entry.toBeCredit,
          salary: entry.salary,
          debt: entry.debt || 0,
          interest_rate: entry.interestRate || 0
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error('Error saving transaction:', transactionError);
        toast({
          title: "Error",
          description: "Failed to save entry. " + transactionError.message,
          variant: "destructive"
        });
        return;
      }
      
      if (newTransaction) {
        // Update local state
        const formattedTransaction: Transaction = {
          id: newTransaction.id,
          date: format(new Date(newTransaction.date), 'yyyy-MM-dd'),
          investment: Number(newTransaction.investment),
          earnings: Number(newTransaction.earnings),
          spending: Number(newTransaction.spending),
          toBeCredit: Number(newTransaction.to_be_credit),
          salary: Number(newTransaction.salary),
          debt: newTransaction.debt ? Number(newTransaction.debt) : 0,
          interestRate: newTransaction.interest_rate ? Number(newTransaction.interest_rate) : 0,
          salaryEntries: [],
          account_id: newTransaction.account_id
        };
        
        setAccountTransactions(prev => {
          const accountTransactionsCopy = { ...prev };
          if (!accountTransactionsCopy[currentAccountId]) {
            accountTransactionsCopy[currentAccountId] = [];
          }
          
          accountTransactionsCopy[currentAccountId] = [
            ...accountTransactionsCopy[currentAccountId],
            formattedTransaction
          ];
          
          return accountTransactionsCopy;
        });
        
        toast({
          title: "Entry saved",
          description: `New entry for ${entry.date} has been created.`
        });
      }
    } catch (error) {
      console.error('Error in handleSaveEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when saving entry.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!currentAccount) return;
    
    try {
      const currentAccountId = currentAccount.id;
      
      // Delete transaction from Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Error",
          description: "Failed to delete entry. " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Update local state
      setAccountTransactions(prev => {
        const accountTransactionsCopy = { ...prev };
        if (!accountTransactionsCopy[currentAccountId]) return prev;
        
        accountTransactionsCopy[currentAccountId] = accountTransactionsCopy[currentAccountId]
          .filter(t => t.id !== id);
        
        return accountTransactionsCopy;
      });
      
      toast({
        title: "Entry deleted",
        description: "The entry has been removed successfully."
      });
    } catch (error) {
      console.error('Error in handleDeleteEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when deleting entry.",
        variant: "destructive"
      });
    }
  };

  const handleTransferCredit = async (date: string, amount: number) => {
    if (!currentAccount) return;
    
    try {
      const currentAccountId = currentAccount.id;
      const transactions = accountTransactions[currentAccountId] || [];
      const existingTransactions = transactions.filter(t => t.date === date);
      
      if (existingTransactions.length > 0) {
        const transactionToUpdate = existingTransactions.find(t => t.toBeCredit >= amount);
        
        if (transactionToUpdate) {
          // Update transaction in Supabase
          const { error } = await supabase
            .from('transactions')
            .update({
              to_be_credit: transactionToUpdate.toBeCredit - amount,
              earnings: transactionToUpdate.earnings + amount
            })
            .eq('id', transactionToUpdate.id);
          
          if (error) {
            console.error('Error updating transaction credit:', error);
            toast({
              title: "Error",
              description: "Failed to transfer credit. " + error.message,
              variant: "destructive"
            });
            return;
          }
          
          // Update local state
          setAccountTransactions(prev => {
            const accountTransactionsCopy = { ...prev };
            if (!accountTransactionsCopy[currentAccountId]) return prev;
            
            accountTransactionsCopy[currentAccountId] = accountTransactionsCopy[currentAccountId].map(t => {
              if (t.id === transactionToUpdate.id) {
                return {
                  ...t,
                  toBeCredit: t.toBeCredit - amount,
                  earnings: t.earnings + amount
                };
              }
              return t;
            });
            
            return accountTransactionsCopy;
          });
          
          toast({
            title: "Credit Transferred",
            description: `${formatCurrency(amount)} has been transferred to earnings for ${date}.`
          });
        }
      }
    } catch (error) {
      console.error('Error in handleTransferCredit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when transferring credit.",
        variant: "destructive"
      });
    }
  };

  const handleAddSalaryEntry = async (entry: SalaryEntry, transactionId?: string) => {
    if (!currentAccount) return;
    
    try {
      const currentAccountId = currentAccount.id;
      const transactions = accountTransactions[currentAccountId] || [];
      
      const existingTransaction = transactionId 
        ? transactions.find(t => t.id === transactionId)
        : transactions.find(t => t.date === entry.date);
      
      if (existingTransaction) {
        // Add salary entry to existing transaction
        const { data: newSalaryEntry, error: salaryError } = await supabase
          .from('salary_entries')
          .insert({
            transaction_id: existingTransaction.id,
            name: entry.name,
            purpose: entry.purpose || '', // Provide default empty string if not provided
            amount: entry.amount,
            date: entry.date
          })
          .select()
          .single();
        
        if (salaryError) {
          console.error('Error adding salary entry:', salaryError);
          toast({
            title: "Error",
            description: "Failed to add salary entry. " + salaryError.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update transaction with new salary total
        const newSalary = (existingTransaction.salary || 0) + entry.amount;
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ salary: newSalary })
          .eq('id', existingTransaction.id);
        
        if (updateError) {
          console.error('Error updating transaction salary:', updateError);
          return;
        }
        
        // Update local state
        setAccountTransactions(prev => {
          const accountTransactionsCopy = { ...prev };
          if (!accountTransactionsCopy[currentAccountId]) return prev;
          
          accountTransactionsCopy[currentAccountId] = accountTransactionsCopy[currentAccountId].map(t => {
            if (t.id === existingTransaction.id) {
              const currentSalaryEntries = t.salaryEntries || [];
              return {
                ...t,
                salary: newSalary,
                salaryEntries: [...currentSalaryEntries, { ...entry, id: newSalaryEntry.id }]
              };
            }
            return t;
          });
          
          return accountTransactionsCopy;
        });
      } else {
        // Create new transaction with salary
        const { data: newTransaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            account_id: currentAccountId,
            date: entry.date,
            investment: 0,
            earnings: 0,
            spending: 0,
            to_be_credit: 0,
            salary: entry.amount
          })
          .select()
          .single();
        
        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
          toast({
            title: "Error",
            description: "Failed to create transaction. " + transactionError.message,
            variant: "destructive"
          });
          return;
        }
        
        // Add salary entry
        const { data: newSalaryEntry, error: salaryError } = await supabase
          .from('salary_entries')
          .insert({
            transaction_id: newTransaction.id,
            name: entry.name,
            purpose: entry.purpose || '', // Provide default empty string if not provided
            amount: entry.amount,
            date: entry.date
          })
          .select()
          .single();
        
        if (salaryError) {
          console.error('Error adding salary entry:', salaryError);
          return;
        }
        
        // Update local state
        const formattedTransaction: Transaction = {
          id: newTransaction.id,
          date: format(new Date(newTransaction.date), 'yyyy-MM-dd'),
          investment: 0,
          earnings: 0,
          spending: 0,
          toBeCredit: 0,
          salary: entry.amount,
          salaryEntries: [{ ...entry, id: newSalaryEntry.id }],
          account_id: newTransaction.account_id
        };
        
        setAccountTransactions(prev => {
          const accountTransactionsCopy = { ...prev };
          if (!accountTransactionsCopy[currentAccountId]) {
            accountTransactionsCopy[currentAccountId] = [];
          }
          
          accountTransactionsCopy[currentAccountId] = [
            ...accountTransactionsCopy[currentAccountId],
            formattedTransaction
          ];
          
          return accountTransactionsCopy;
        });
      }
      
      toast({
        title: "Salary Entry Added",
        description: `New salary entry for ${entry.name} has been added.`
      });
    } catch (error) {
      console.error('Error in handleAddSalaryEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when adding salary entry.",
        variant: "destructive"
      });
    }
  };

  const handleAddDebtEntry = async (entry: DebtEntry) => {
    if (!currentAccount || !showDebtFeature) return;
    
    try {
      const currentAccountId = currentAccount.id;
      const transactions = accountTransactions[currentAccountId] || [];
      const existingTransaction = transactions.find(t => t.date === entry.date);
      
      if (existingTransaction) {
        // Update existing transaction with debt info
        const newDebtAmount = (existingTransaction.debt || 0) + entry.amount;
        
        const { error } = await supabase
          .from('transactions')
          .update({
            debt: newDebtAmount,
            interest_rate: entry.interestRate
          })
          .eq('id', existingTransaction.id);
        
        if (error) {
          console.error('Error updating transaction debt:', error);
          toast({
            title: "Error",
            description: "Failed to update debt entry. " + error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        setAccountTransactions(prev => {
          const accountTransactionsCopy = { ...prev };
          if (!accountTransactionsCopy[currentAccountId]) return prev;
          
          accountTransactionsCopy[currentAccountId] = accountTransactionsCopy[currentAccountId].map(t => {
            if (t.id === existingTransaction.id) {
              return {
                ...t,
                debt: newDebtAmount,
                interestRate: entry.interestRate
              };
            }
            return t;
          });
          
          return accountTransactionsCopy;
        });
      } else {
        // Create new transaction with debt info
        const { data: newTransaction, error } = await supabase
          .from('transactions')
          .insert({
            account_id: currentAccountId,
            date: entry.date,
            investment: 0,
            earnings: 0,
            spending: 0,
            to_be_credit: 0,
            salary: 0,
            debt: entry.amount,
            interest_rate: entry.interestRate
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating debt transaction:', error);
          toast({
            title: "Error",
            description: "Failed to create debt entry. " + error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        const formattedTransaction: Transaction = {
          id: newTransaction.id,
          date: format(new Date(newTransaction.date), 'yyyy-MM-dd'),
          investment: 0,
          earnings: 0,
          spending: 0,
          toBeCredit: 0,
          salary: 0,
          debt: entry.amount,
          interestRate: entry.interestRate,
          salaryEntries: [],
          account_id: newTransaction.account_id
        };
        
        setAccountTransactions(prev => {
          const accountTransactionsCopy = { ...prev };
          if (!accountTransactionsCopy[currentAccountId]) {
            accountTransactionsCopy[currentAccountId] = [];
          }
          
          accountTransactionsCopy[currentAccountId] = [
            ...accountTransactionsCopy[currentAccountId],
            formattedTransaction
          ];
          
          return accountTransactionsCopy;
        });
      }
      
      toast({
        title: "Debt Entry Added",
        description: `New debt entry of ${formatCurrency(entry.amount)} with ${entry.interestRate}% interest has been added.`
      });
    } catch (error) {
      console.error('Error in handleAddDebtEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when adding debt entry.",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = () => {
    if (!currentAccount) return;
    
    const transactions = accountTransactions[currentAccount.id] || [];
    const headers = ['Date', 'Investment', 'Earnings', 'Spending', 'To Be Credit', 'Salary', 'Debt', 'Interest Rate', 'Net', 'ID'];
    
    const rows = transactions.map(t => {
      const monthlyInterest = t.debt && t.interestRate ? (t.debt * t.interestRate) / (12 * 100) : 0;
      const netAmount = t.earnings - t.investment - t.spending + t.toBeCredit + (t.salary || 0) - monthlyInterest;
      
      return [
        t.date,
        t.investment.toString(),
        t.earnings.toString(),
        t.spending.toString(),
        t.toBeCredit.toString(),
        (t.salary || 0).toString(),
        (t.debt || 0).toString(),
        (t.interestRate || 0).toString(),
        netAmount.toString(),
        t.id
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_data_${currentAccount.name}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Your financial data has been exported as CSV."
    });
  };

  return {
    handleSaveEntry,
    handleDeleteEntry,
    handleTransferCredit,
    handleAddSalaryEntry,
    handleAddDebtEntry,
    handleExportCSV
  };
};
