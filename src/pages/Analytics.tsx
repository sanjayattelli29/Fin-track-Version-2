
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import FinanceHeader from '@/components/FinanceHeader';
import SpendingBreakdown from '@/components/Analytics/SpendingBreakdown';
import IncomeSourcesChart from '@/components/Analytics/IncomeSourcesChart';
import SavingsGoalTracker from '@/components/Analytics/SavingsGoalTracker';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Account, Transaction } from '@/hooks/transactions/types';

const Analytics = () => {
  const [username, setUsername] = useState<string>("Sanjay Kumar");
  const [profileImage, setProfileImage] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user profile
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUsername(profile.name || "Sanjay Kumar");
      if (profile.imageUrl) {
        setProfileImage(profile.imageUrl);
      }
    }
    
    // Function to reload accounts and transactions
    const reloadData = () => {
      // Load accounts
      const savedAccounts = localStorage.getItem('user_accounts');
      let parsedAccounts: Account[] = [];
      if (savedAccounts) {
        parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(parsedAccounts);

        const activeAccount = parsedAccounts.find((acc) => acc.isActive);
        if (activeAccount) {
          setCurrentAccount(activeAccount);
        } else if (parsedAccounts.length > 0) {
          setCurrentAccount(parsedAccounts[0]);
        } else {
          setCurrentAccount(null);
        }
      } else {
        setAccounts([]);
        setCurrentAccount(null);
      }

      // Load transactions
      const savedTransactions = localStorage.getItem('finance_transactions');
      if (savedTransactions) {
        try {
          const allTransactions = JSON.parse(savedTransactions);
          if (typeof allTransactions === 'object' && !Array.isArray(allTransactions)) {
            setTransactions(allTransactions);
          } else {
            const defaultAccountId = parsedAccounts.length > 0 ? parsedAccounts[0].id : "1";
            const transactionsObject: Record<string, Transaction[]> = {
              [defaultAccountId]: allTransactions as Transaction[]
            };
            setTransactions(transactionsObject);
          }
        } catch (error) {
          setTransactions({});
        }
      } else {
        setTransactions({});
      }
    };

    reloadData();

    // Listen for storage changes (account switch, etc.)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'user_accounts' || event.key === 'finance_transactions') {
        reloadData();
      }
    };

    // Listen for window focus (user returns to tab)
    const handleFocus = () => {
      reloadData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadTransactions = () => {
    const savedTransactions = localStorage.getItem('finance_transactions');
    if (savedTransactions) {
      try {
        const allTransactions = JSON.parse(savedTransactions);
        if (typeof allTransactions === 'object' && !Array.isArray(allTransactions)) {
          // New format (by account)
          setTransactions(allTransactions);
        } else {
          // Legacy format (all in one array)
          const defaultAccountId = accounts.length > 0 ? accounts[0].id : "1";
          const transactionsObject: Record<string, any[]> = {
            [defaultAccountId]: allTransactions
          };
          setTransactions(transactionsObject);
        }
      } catch (error) {
        console.error("Error parsing transactions:", error);
        setTransactions({});
      }
    }
  };

  const getCurrentAccountTransactions = (): Transaction[] => {
    if (!currentAccount) return [];
    return transactions[currentAccount.id] || [];
  };

  const getCurrentMonthTransactions = (): Transaction[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return getCurrentAccountTransactions().filter((t) => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
  };

  const handleSendEmail = async () => {
    // Reuse the existing email functionality
    navigate('/'); // Just navigate back to dashboard for now
  };

  return (
    <div className="min-h-screen px-2 py-4 w-full mx-auto">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <FinanceHeader 
            username={username}
            currentAccount={currentAccount?.name || "No Account"} 
            profileImage={profileImage}
            onSendEmail={handleSendEmail}
          />
        </div>
        
        <main className="mt-4">
          <h2 className="text-2xl font-bold mb-6">Financial Analytics</h2>
          
          {isMobile ? (
            <Tabs defaultValue="spending" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="spending">Spending</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="savings">Savings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="spending">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Breakdown</CardTitle>
                    <CardDescription>Where your money is going</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SpendingBreakdown transactions={getCurrentMonthTransactions()} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="income">
                <Card>
                  <CardHeader>
                    <CardTitle>Income Sources</CardTitle>
                    <CardDescription>Your revenue streams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncomeSourcesChart transactions={getCurrentMonthTransactions()} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="savings">
                <Card>
                  <CardHeader>
                    <CardTitle>Savings Goals</CardTitle>
                    <CardDescription>Track your progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SavingsGoalTracker transactions={getCurrentMonthTransactions()} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Breakdown</CardTitle>
                  <CardDescription>Where your money is going</CardDescription>
                </CardHeader>
                <CardContent>
                  <SpendingBreakdown transactions={getCurrentMonthTransactions()} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Income Sources</CardTitle>
                  <CardDescription>Your revenue streams</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeSourcesChart transactions={getCurrentMonthTransactions()} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Savings Goals</CardTitle>
                  <CardDescription>Track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <SavingsGoalTracker transactions={getCurrentMonthTransactions()} />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Analytics;
