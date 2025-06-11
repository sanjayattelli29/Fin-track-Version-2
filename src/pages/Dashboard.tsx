
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import Footer from '@/components/Footer';
import FloatingTools from '@/components/FloatingTools/FloatingTools';
import ThemeToggle from '@/components/ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { simulateEmailSending } from '@/utils/emailUtils';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const {
    username,
    profileImage,
    showAllAccountsAnalysis,
    isLoading: profileLoading
  } = useUserProfile();
  
  const {
    accounts,
    currentAccount,
    accountTransactions,
    summaryData,
    commission,
    tax,
    showDebtFeature,
    isLoading: transactionsLoading,
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
  } = useTransactions(selectedDate);
  
  // Force refresh when component mounts
  useEffect(() => {
    refreshData();
  }, []);
  
  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleSendEmail = async () => {
    return await simulateEmailSending();
  };
  
  const isLoading = profileLoading || transactionsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your finance data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen px-2 py-4 w-full mx-auto">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <DashboardHeader 
            username={username}
            currentAccount={currentAccount?.name || "No Account"} 
            profileImage={profileImage}
            onSendEmail={handleSendEmail}
          />
          
          <div className={`${isMobile ? 'block' : 'hidden'}`}>
            <div className="flex justify-end mb-2">
              <ThemeToggle />
              <Link to="/profile" className="flex items-center gap-2 bg-primary/10 p-2 rounded-full ml-2">
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      
        <main>
          <DashboardContent
            showAllAccountsAnalysis={showAllAccountsAnalysis}
            summaryData={summaryData}
            selectedDate={selectedDate}
            calendarTransactions={getCurrentMonthCalendarTransactions()}
            transactions={getCurrentAccountTransactions()}
            defaultCommission={commission}
            defaultTax={tax}
            defaultValues={getCurrentAccountTransactions().find(t => t.date === format(selectedDate, 'yyyy-MM-dd'))}
            showDebtFields={showDebtFeature}
            onSelectDate={setSelectedDate}
            onSaveEntry={handleSaveEntry}
            onDeleteEntry={handleDeleteEntry}
            onTransferCredit={handleTransferCredit}
            onMonthChange={handleMonthChange}
            onAddSalaryEntry={handleAddSalaryEntry}
            onAddDebtEntry={handleAddDebtEntry}
            onSaveDefaults={handleSaveDefaultRates}
            onExport={handleExportCSV}
            accountTransactions={accountTransactions}
            accounts={accounts}
            onSendEmail={handleSendEmail}
          />
        </main>
      
        <Footer />
      
        <FloatingTools />
      </div>
    </div>
  );
};

export default Dashboard;
