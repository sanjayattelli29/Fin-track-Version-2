
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Account } from './types';

export const useAccounts = (refreshKey: number) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load accounts from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        
        const { data: accountsData, error } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error fetching accounts:', error);
          toast({
            title: 'Error',
            description: 'Failed to load accounts. Please refresh the page.',
            variant: 'destructive'
          });
          return;
        }
        
        if (!accountsData || accountsData.length === 0) {
          // Create the main account if none exists
          const { data: newAccount, error: createError } = await supabase
            .from('accounts')
            .insert([{ name: 'Main Account', is_active: true }])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating main account:', createError);
            toast({
              title: 'Error',
              description: 'Failed to create default account.',
              variant: 'destructive'
            });
            return;
          }
          
          const formattedAccount: Account = {
            id: newAccount.id,
            name: newAccount.name,
            isActive: true,
            accountNumber: 1
          };
          
          if (isMounted) {
            setAccounts([formattedAccount]);
            setCurrentAccount(formattedAccount);
          }
        } else {
          // Format accounts and find active one
          const formattedAccounts: Account[] = accountsData.map((account, index) => ({
            id: account.id,
            name: account.name,
            isActive: account.is_active || false,
            accountNumber: index + 1
          }));
          
          if (isMounted) {
            setAccounts(formattedAccounts);
            
            const activeAccount = formattedAccounts.find(account => account.isActive);
            if (activeAccount) {
              setCurrentAccount(activeAccount);
            } else if (formattedAccounts.length > 0) {
              // If no active account, make the first one active
              await handleSelectAccount(formattedAccounts[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchAccounts:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'An unexpected error occurred while loading accounts.',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAccounts();
    
    return () => {
      isMounted = false;
    };
  }, [toast, refreshKey]);

  const handleCreateAccount = async (name: string): Promise<Account | undefined> => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create account in Supabase
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          name: name.trim(),
          is_active: false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating account:', error);
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Format and add to local state
      const newAccount: Account = {
        id: data.id,
        name: data.name,
        isActive: false,
        accountNumber: accounts.length + 1
      };
      
      setAccounts(prev => [...prev, newAccount]);
      
      toast({
        title: "Account Created",
        description: `${name} has been created successfully.`,
      });
      
      return newAccount;
    } catch (error) {
      console.error('Error in handleCreateAccount:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAccount = async (accountId: string): Promise<Account | undefined> => {
    try {
      // Use the database function for account switching
      const { data, error } = await supabase.rpc('switch_to_account', {
        target_account_id: accountId
      });
      
      if (error) {
        console.error('Error switching account:', error);
        toast({
          title: "Error",
          description: "Failed to switch account. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      const updatedAccounts = accounts.map(account => ({
        ...account,
        isActive: account.id === accountId
      }));
      
      setAccounts(updatedAccounts);
      
      const selectedAccount = updatedAccounts.find(acc => acc.id === accountId);
      if (selectedAccount) {
        setCurrentAccount(selectedAccount);
        
        toast({
          title: "Account Switched",
          description: `Successfully switched to ${selectedAccount.name}.`,
        });
      }
      
      return selectedAccount;
    } catch (error) {
      console.error('Error in handleSelectAccount:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while switching accounts.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (accounts.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one account.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete account from Supabase (cascading will handle related data)
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      const updatedAccounts = accounts.filter(account => account.id !== accountId);
      setAccounts(updatedAccounts);
      
      // If deleted account was current, switch to first available
      if (currentAccount?.id === accountId) {
        if (updatedAccounts.length > 0) {
          await handleSelectAccount(updatedAccounts[0].id);
        }
      }
      
      toast({
        title: "Account Deleted",
        description: "The account and all associated data have been deleted.",
      });
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleEditAccount = async (accountId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update account in Supabase
      const { error } = await supabase
        .from('accounts')
        .update({ name: newName.trim() })
        .eq('id', accountId);
      
      if (error) {
        console.error('Error updating account:', error);
        toast({
          title: "Error",
          description: "Failed to update account. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      const updatedAccounts = accounts.map(account => 
        account.id === accountId ? { ...account, name: newName.trim() } : account
      );
      
      setAccounts(updatedAccounts);
      
      if (currentAccount?.id === accountId) {
        setCurrentAccount({ ...currentAccount, name: newName.trim() });
      }
      
      toast({
        title: "Account Updated",
        description: "The account name has been updated.",
      });
    } catch (error) {
      console.error('Error in handleEditAccount:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return {
    accounts,
    currentAccount,
    isLoadingAccounts: isLoading,
    handleCreateAccount,
    handleSelectAccount,
    handleDeleteAccount,
    handleEditAccount
  };
};
