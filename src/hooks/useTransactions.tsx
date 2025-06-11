
import { useState } from 'react';
import { useAccounts } from './transactions/useAccounts';
import { useSettings } from './transactions/useSettings';
import { useTransactionData } from './transactions/useTransactionData';
import { useTransactionOperations } from './transactions/useTransactionOperations';
import { SalaryEntry, DebtEntry, Transaction, Account, CalendarTransaction, SummaryData } from './transactions/types';

export type { SalaryEntry, DebtEntry, Transaction, Account, CalendarTransaction, SummaryData };

export const useTransactions = (selectedDate: Date) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Accounts management
  const { 
    accounts, 
    currentAccount, 
    isLoadingAccounts,
    handleCreateAccount,
    handleSelectAccount
  } = useAccounts(refreshKey);
  
  // Settings and rates
  const {
    commission,
    tax,
    showDebtFeature,
    handleSaveDefaultRates
  } = useSettings();
  
  // Transaction data
  const {
    accountTransactions,
    setAccountTransactions,
    summaryData,
    isLoadingTransactions,
    getCurrentAccountTransactions,
    getCurrentMonthTransactions,
    getCurrentMonthCalendarTransactions
  } = useTransactionData(accounts, currentAccount, selectedDate, showDebtFeature);
  
  // Transaction operations
  const {
    handleSaveEntry,
    handleDeleteEntry,
    handleTransferCredit,
    handleAddSalaryEntry,
    handleAddDebtEntry,
    handleExportCSV
  } = useTransactionOperations(
    currentAccount, 
    accountTransactions, 
    setAccountTransactions,
    showDebtFeature
  );
  
  // Function to force refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const isLoading = isLoadingAccounts || isLoadingTransactions;

  // Return aggregated functionality
  return {
    accounts,
    currentAccount,
    accountTransactions,
    summaryData,
    commission,
    tax,
    showDebtFeature,
    isLoading,
    getCurrentAccountTransactions,
    getCurrentMonthTransactions,
    getCurrentMonthCalendarTransactions,
    handleSaveEntry,
    handleDeleteEntry,
    handleTransferCredit,
    handleAddSalaryEntry,
    handleAddDebtEntry,
    handleSaveDefaultRates,
    handleExportCSV,
    handleCreateAccount,
    handleSelectAccount,
    refreshData
  };
};
