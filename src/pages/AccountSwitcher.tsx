
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccounts } from '@/hooks/transactions/useAccounts';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

const AccountSwitcher = () => {
  const navigate = useNavigate();
  const { 
    accounts, 
    currentAccount,
    isLoadingAccounts,
    handleCreateAccount,
    handleSelectAccount 
  } = useAccounts(0);

  const handleSwitchAndOpen = async (accountId: string) => {
    try {
      const selectedAccount = await handleSelectAccount(accountId);
      if (selectedAccount) {
        // Add delay to ensure switch is complete
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('Error switching and opening account:', error);
    }
  };

  const handleCreateAndOpen = async () => {
    const accountName = prompt('Enter new account name:');
    if (accountName?.trim()) {
      try {
        const newAccount = await handleCreateAccount(accountName.trim());
        if (newAccount) {
          const selectedAccount = await handleSelectAccount(newAccount.id);
          if (selectedAccount) {
            setTimeout(() => {
              navigate('/dashboard');
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error creating and opening account:', error);
      }
    }
  };

  if (isLoadingAccounts) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-foreground p-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading accounts..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0f1d] text-foreground p-4">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-3 hover:text-primary transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold">Account Management</h1>
            </div>
            <Button onClick={handleCreateAndOpen} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </header>

          <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Accounts ({accounts.length})</h2>
              <Badge variant="outline" className="bg-primary/10">
                <Database className="h-3 w-3 mr-1" />
                Isolated Data
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Select an account to switch to it and open the dashboard. Each account maintains completely separate financial data.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    account.isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex flex-col space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{account.name}</h3>
                        <Badge variant={account.isActive ? "default" : "secondary"} className="text-xs">
                          #{account.accountNumber}
                        </Badge>
                      </div>
                      {account.isActive && (
                        <p className="text-sm text-primary">Current Account</p>
                      )}
                    </div>
                    
                    {account.isActive ? (
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                      >
                        Open Dashboard
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSwitchAndOpen(account.id)}
                        variant="outline"
                        className="w-full"
                      >
                        Switch & Open
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Data Isolation Features:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each account has completely separate transactions</li>
                <li>• Salary entries and invoices are account-specific</li>
                <li>• Account switching preserves all data independently</li>
                <li>• Manage accounts from the Profile Settings page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AccountSwitcher;
