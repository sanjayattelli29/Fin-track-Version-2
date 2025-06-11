
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccountsManagementSectionProps {
  accounts: { id: string; name: string; isActive: boolean }[];
  activeAccountName: string;
  onCreateAccount: (name: string) => void;
  onDeleteAccount: (id: string) => void;
  onEditAccount: (id: string, newName: string) => void;
  onSwitchAccount: (id: string) => void;
}

const AccountsManagementSection: React.FC<AccountsManagementSectionProps> = ({
  accounts,
  onCreateAccount,
  onDeleteAccount,
  onEditAccount,
  onSwitchAccount,
}) => {
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    
    try {
      setIsProcessing(true);
      await onCreateAccount(newAccountName.trim());
      setNewAccountName("");
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAccount = async (accountId: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      setIsProcessing(true);
      await onEditAccount(accountId, newName.trim());
    } catch (error) {
      console.error('Error editing account:', error);
    } finally {
      setEditingAccount(null);
      setIsProcessing(false);
    }
  };

  const handleSwitchToAccount = async (accountId: string) => {
    try {
      setIsProcessing(true);
      await onSwitchAccount(accountId);
      
      // Add a small delay to ensure the switch is complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAccountId = accounts.find(acc => acc.isActive)?.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Account Management</h2>
        <p className="text-sm text-muted-foreground">
          Each account maintains separate financial data
        </p>
      </div>

      {/* Information Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Switch between accounts to manage different sets of financial data. 
          All transactions, salary entries, and invoices are isolated per account.
        </AlertDescription>
      </Alert>

      {/* Create New Account */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Create New Account</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Enter account name (e.g., Business, Personal)"
            className="flex-1 p-2 border rounded-lg bg-background"
            maxLength={50}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isProcessing) {
                handleAddAccount();
              }
            }}
            disabled={isProcessing}
          />
          <Button 
            onClick={handleAddAccount}
            disabled={!newAccountName.trim() || isProcessing}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isProcessing ? 'Creating...' : 'Add Account'}
          </Button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Your Accounts ({accounts.length})</h3>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`p-4 rounded-lg border transition-colors ${
                account.id === currentAccountId
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {editingAccount === account.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue={account.name}
                    className="flex-1 p-2 border rounded-lg bg-background"
                    maxLength={50}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isProcessing) {
                        handleEditAccount(account.id, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        setEditingAccount(null);
                      }
                    }}
                    onBlur={(e) => {
                      if (!isProcessing) {
                        handleEditAccount(account.id, e.target.value);
                      }
                    }}
                    disabled={isProcessing}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{account.name}</h4>
                    {account.id === currentAccountId && (
                      <p className="text-sm text-primary">Current Account</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {account.id !== currentAccountId && (
                      <Button
                        onClick={() => handleSwitchToAccount(account.id)}
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Switching...' : 'Switch & Open'}
                      </Button>
                    )}
                    <Button
                      onClick={() => setEditingAccount(account.id)}
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {accounts.length > 1 && (
                      <Button
                        onClick={() => onDeleteAccount(account.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Account Isolation Features:</h4>
        <ul className="space-y-1">
          <li>• Each account has completely separate financial data</li>
          <li>• Transactions, salary entries, and invoices are account-specific</li>
          <li>• Switching accounts changes your entire dashboard view</li>
          <li>• Account deletion removes all associated data permanently</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountsManagementSection;
