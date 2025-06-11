
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Account, Transaction, CalendarTransaction, SummaryData } from './types';

export const useTransactionData = (
  accounts: Account[], 
  currentAccount: Account | null,
  selectedDate: Date,
  showDebtFeature: boolean
) => {
  const [accountTransactions, setAccountTransactions] = useState<Record<string, Transaction[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    remaining: 0,
    income: 0,
    expenses: 0,
    toBeCredit: 0,
    salary: 0,
    showDebt: false
  });

  // Load transactions from Supabase
  useEffect(() => {
    const fetchAllTransactions = async () => {
      if (!accounts.length) return;

      const transactions: Record<string, Transaction[]> = {};
      
      // Fetch transactions for each account
      for (const account of accounts) {
        try {
          setIsLoading(true);
          const { data: transactionsData, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('account_id', account.id);
          
          if (error) {
            console.error(`Error fetching transactions for account ${account.id}:`, error);
            continue;
          }
          
          if (!transactionsData) continue;
          
          // Fetch salary entries for all transactions in this account
          const transactionIds = transactionsData.map(t => t.id);
          
          let salaryEntriesMap: Record<string, any[]> = {};
          
          if (transactionIds.length > 0) {
            const { data: salaryEntriesData, error: salaryError } = await supabase
              .from('salary_entries')
              .select('*')
              .in('transaction_id', transactionIds);
            
            if (salaryError) {
              console.error('Error fetching salary entries:', salaryError);
            } else if (salaryEntriesData) {
              // Group salary entries by transaction_id
              salaryEntriesData.forEach(entry => {
                const transactionId = entry.transaction_id;
                if (!salaryEntriesMap[transactionId]) {
                  salaryEntriesMap[transactionId] = [];
                }
                
                salaryEntriesMap[transactionId].push({
                  id: entry.id,
                  name: entry.name,
                  purpose: entry.purpose || '',
                  amount: Number(entry.amount),
                  date: format(new Date(entry.date), 'yyyy-MM-dd')
                });
              });
            }
          }
          
          // Format transactions
          const formattedTransactions: Transaction[] = transactionsData.map(t => ({
            id: t.id,
            date: format(new Date(t.date), 'yyyy-MM-dd'),
            investment: Number(t.investment),
            earnings: Number(t.earnings),
            spending: Number(t.spending),
            toBeCredit: Number(t.to_be_credit),
            salary: t.salary ? Number(t.salary) : 0,
            debt: t.debt ? Number(t.debt) : 0,
            interestRate: t.interest_rate ? Number(t.interest_rate) : 0,
            salaryEntries: salaryEntriesMap[t.id] || [],
            account_id: t.account_id
          }));
          
          transactions[account.id] = formattedTransactions;
        } catch (error) {
          console.error(`Error processing transactions for account ${account.id}:`, error);
        }
      }
      
      setAccountTransactions(transactions);
      setIsLoading(false);
    };
    
    if (accounts.length > 0) {
      fetchAllTransactions();
    }
  }, [accounts]);

  // Get current account transactions
  const getCurrentAccountTransactions = () => {
    if (!currentAccount) return [];
    return accountTransactions[currentAccount.id] || [];
  };

  // Get current month transactions
  const getCurrentMonthTransactions = (transactions: Transaction[] = []) => {
    const viewMonth = selectedDate.getMonth();
    const viewYear = selectedDate.getFullYear();
    const transactionsToUse = transactions.length > 0 ? transactions : getCurrentAccountTransactions();
    
    return transactionsToUse.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === viewMonth && date.getFullYear() === viewYear;
    });
  };

  // Prepare calendar transactions
  const prepareCalendarTransactions = () => {
    return getCurrentAccountTransactions().flatMap(t => {
      const entries: CalendarTransaction[] = [];
      
      if (t.earnings > 0) {
        entries.push({
          id: t.id,
          date: t.date,
          amount: t.earnings,
          type: 'income' as const
        });
      }
      
      if (t.investment > 0 || t.spending > 0) {
        entries.push({
          id: t.id,
          date: t.date,
          amount: -(t.investment + t.spending),
          type: 'expense' as const
        });
      }
      
      if (t.salary && t.salary > 0) {
        entries.push({
          id: t.id,
          date: t.date,
          amount: t.salary,
          type: 'salary' as const
        });
      }
      
      if (t.toBeCredit > 0) {
        entries.push({
          id: t.id,
          date: t.date,
          amount: t.toBeCredit,
          type: 'toBeCredit' as const
        });
      }
  
      if (showDebtFeature && t.debt && t.debt > 0) {
        entries.push({
          id: t.id,
          date: t.date,
          amount: t.debt,
          type: 'debt' as const
        });
        
        if (t.interestRate && t.interestRate > 0) {
          const monthlyInterest = (t.debt * t.interestRate) / (12 * 100);
          entries.push({
            id: t.id,
            date: t.date,
            amount: -monthlyInterest,
            type: 'interest' as const
          });
        }
      }
      
      if (entries.length === 0) {
        const netAmount = t.earnings - t.investment - t.spending + (t.salary || 0);
        entries.push({
          id: t.id,
          date: t.date,
          amount: netAmount,
          type: netAmount >= 0 ? 'income' as const : 'expense' as const
        });
      }
      
      return entries;
    });
  };

  // Get current month calendar transactions
  const getCurrentMonthCalendarTransactions = () => {
    const calendarTransactions = prepareCalendarTransactions();
    const viewMonth = selectedDate.getMonth();
    const viewYear = selectedDate.getFullYear();
    
    return calendarTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === viewMonth && date.getFullYear() === viewYear;
    });
  };

  // Calculate summary data
  useEffect(() => {
    if (!currentAccount) return;
    
    const currentAccountId = currentAccount.id;
    const transactions = accountTransactions[currentAccountId] || [];
    const currentMonthTransactions = getCurrentMonthTransactions(transactions);
    
    const salaryEntries = currentMonthTransactions
      .filter(t => t.salaryEntries && t.salaryEntries.length > 0)
      .flatMap(t => t.salaryEntries || []);
    
    const totalIncome = currentMonthTransactions.reduce((sum, t) => sum + t.earnings, 0);
    const totalExpenses = currentMonthTransactions.reduce((sum, t) => sum + (t.investment + t.spending), 0);
    const totalToBeCredit = currentMonthTransactions.reduce((sum, t) => sum + t.toBeCredit, 0);
    const totalSalary = currentMonthTransactions.reduce((sum, t) => sum + (t.salary || 0), 0);
    
    let totalDebt = 0;
    let totalInterest = 0;
    
    if (showDebtFeature) {
      totalDebt = currentMonthTransactions.reduce((sum, t) => sum + (t.debt || 0), 0);
      
      totalInterest = currentMonthTransactions.reduce((sum, t) => {
        if (t.debt && t.interestRate) {
          return sum + ((t.debt * t.interestRate) / (12 * 100));
        }
        return sum;
      }, 0);
    }
    
    const remaining = totalIncome - totalExpenses - totalSalary + totalToBeCredit - totalInterest;
    
    setSummaryData({
      remaining,
      income: totalIncome,
      expenses: totalExpenses + totalSalary,
      toBeCredit: totalToBeCredit,
      salary: totalSalary,
      debt: totalDebt,
      interest: totalInterest,
      showDebt: showDebtFeature,
      salaryEntries: salaryEntries
    });
  }, [accountTransactions, selectedDate, currentAccount, showDebtFeature]);

  return {
    accountTransactions,
    setAccountTransactions,
    summaryData,
    isLoadingTransactions: isLoading,
    getCurrentAccountTransactions,
    getCurrentMonthTransactions,
    getCurrentMonthCalendarTransactions
  };
};
