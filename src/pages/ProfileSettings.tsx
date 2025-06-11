import React, { useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAccounts } from "@/hooks/transactions/useAccounts";

// Import refactored components
import PersonalInfoSection from "@/components/ProfileSettings/PersonalInfoSection";
import AccountsManagementSection from "@/components/ProfileSettings/AccountsManagementSection";
import FeaturesSection from "@/components/ProfileSettings/FeaturesSection";
import InvoicesSection from "@/components/ProfileSettings/InvoicesSection";
import SalaryEntriesSection from "@/components/ProfileSettings/SalaryEntriesSection";
import { Invoice } from "@/components/ProfileSettings/InvoicesSection";

interface ProfileData {
  name: string;
  phone: string;
  imageUrl: string;
  currency: string;
  showAllAccountsAnalysis: boolean;
  showDebtFeature?: boolean;
  debtPrincipal?: number;
  debtInterestRate?: number;
}

interface SalaryEntry {
  name: string;
  purpose: string;
  amount: number;
  date: string;
  id?: string;
}

const ProfileSettings = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Sanjay Kumar",
    phone: "+91 8977300290",
    imageUrl: "https://designwithsanjay.site/static/media/HeroImage.96b29a6adf82c5484",
    currency: "INR (₹)",
    showAllAccountsAnalysis: false,
    showDebtFeature: false
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeSection, setActiveSection] = useState<'personal' | 'accounts' | 'invoices' | 'features'>('personal');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [salaryEntries, setSalaryEntries] = useState<SalaryEntry[]>([]);
  const [editingSalaryEntry, setEditingSalaryEntry] = useState<SalaryEntry | null>(null);
  const [debtPrincipal, setDebtPrincipal] = useState<string>("");
  const [debtInterestRate, setDebtInterestRate] = useState<string>("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use the useAccounts hook
  const {
    accounts,
    currentAccount,
    isLoadingAccounts,
    handleCreateAccount,
    handleSelectAccount,
    handleDeleteAccount,
    handleEditAccount
  } = useAccounts(refreshKey);

  // Fetch profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          const updatedProfile = {
            name: data.name || 'Sanjay Kumar',
            phone: data.phone || '+91 8977300290',
            imageUrl: data.image_url || '',
            currency: data.currency || 'INR (₹)',
            showAllAccountsAnalysis: data.show_all_accounts_analysis || false,
            showDebtFeature: data.show_debt_feature || false,
            debtPrincipal: data.debt_principal,
            debtInterestRate: data.debt_interest_rate
          };
          
          setProfile(updatedProfile);
          
          if (data.debt_principal) {
            setDebtPrincipal(data.debt_principal.toString());
          }
          
          if (data.debt_interest_rate) {
            setDebtInterestRate(data.debt_interest_rate.toString());
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Fetch invoices from Supabase
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*');
        
        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError);
          return;
        }
        
        if (invoicesData) {
          // Fetch invoice items for each invoice
          const formattedInvoices: Invoice[] = [];
          
          for (const invoice of invoicesData) {
            const { data: itemsData, error: itemsError } = await supabase
              .from('invoice_items')
              .select('*')
              .eq('invoice_id', invoice.id);
            
            if (itemsError) {
              console.error(`Error fetching items for invoice ${invoice.id}:`, itemsError);
              continue;
            }
            
            const formattedItems = itemsData ? itemsData.map(item => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              rate: Number(item.rate),
              amount: Number(item.amount)
            })) : [];
            
            formattedInvoices.push({
              invoiceNumber: invoice.invoice_number,
              date: format(new Date(invoice.date), 'yyyy-MM-dd'),
              dueDate: format(new Date(invoice.due_date), 'yyyy-MM-dd'),
              accountName: invoice.account_name,
              clientName: invoice.client_name,
              clientEmail: invoice.client_email || '',
              clientAddress: invoice.client_address || '',
              items: formattedItems,
              notes: invoice.notes || '',
              totalAmount: Number(invoice.total_amount),
              logoUrl: invoice.logo_url
            });
          }
          
          setInvoices(formattedInvoices);
        }
      } catch (error) {
        console.error('Error in fetchInvoices:', error);
      }
    };
    
    fetchInvoices();
  }, []);
  
  // Fetch salary entries from Supabase
  useEffect(() => {
    const fetchSalaryEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('salary_entries')
          .select('*');
        
        if (error) {
          console.error('Error fetching salary entries:', error);
          return;
        }
        
        if (data) {
          const formattedEntries: SalaryEntry[] = data.map(entry => ({
            id: entry.id,
            name: entry.name,
            purpose: entry.purpose || '',
            amount: Number(entry.amount),
            date: format(new Date(entry.date), 'yyyy-MM-dd')
          }));
          
          setSalaryEntries(formattedEntries);
        }
      } catch (error) {
        console.error('Error in fetchSalaryEntries:', error);
      }
    };
    
    fetchSalaryEntries();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      
      const profileId = data?.id;
      
      const updatedProfile = {
        name: profile.name,
        phone: profile.phone,
        image_url: profile.imageUrl,
        currency: profile.currency,
        show_all_accounts_analysis: profile.showAllAccountsAnalysis,
        show_debt_feature: profile.showDebtFeature,
        debt_principal: debtPrincipal ? parseFloat(debtPrincipal) : null,
        debt_interest_rate: debtInterestRate ? parseFloat(debtInterestRate) : null
      };
      
      let error;
      
      if (profileId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updatedProfile)
          .eq('id', profileId);
          
        error = updateError;
      } else {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([updatedProfile]);
          
        error = createError;
      }
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: "There was a problem updating your profile: " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error in handleProfileUpdate:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleSwitchAccount = async (id: string) => {
    const result = await handleSelectAccount(id);
    if (result) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const handleToggleDebtFeature = async (enabled: boolean) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }
      
      if (data) {
        const { error } = await supabase
          .from('profiles')
          .update({ show_debt_feature: enabled })
          .eq('id', data.id);
          
        if (error) {
          console.error('Error updating debt feature:', error);
          toast({
            title: "Error",
            description: "Failed to update feature settings: " + error.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert([{
            name: profile.name,
            phone: profile.phone,
            image_url: profile.imageUrl,
            currency: profile.currency,
            show_all_accounts_analysis: profile.showAllAccountsAnalysis,
            show_debt_feature: enabled
          }]);
          
        if (error) {
          console.error('Error creating profile with debt feature:', error);
          return;
        }
      }
      
      setProfile(prev => ({ ...prev, showDebtFeature: enabled }));
      
      toast({
        title: enabled ? "Debt Feature Enabled" : "Debt Feature Disabled",
        description: enabled 
          ? "You can now track debt and interest in your financial records." 
          : "Debt tracking has been disabled.",
      });
    } catch (error) {
      console.error('Error in handleToggleDebtFeature:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSaveInvoice = async (invoiceData: Invoice) => {
    try {
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceData.invoiceNumber,
          date: invoiceData.date,
          due_date: invoiceData.dueDate,
          account_name: invoiceData.accountName,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_address: invoiceData.clientAddress,
          notes: invoiceData.notes,
          total_amount: invoiceData.totalAmount,
          logo_url: invoiceData.logoUrl
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating invoice:', error);
        toast({
          title: "Error",
          description: "Failed to create invoice: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (newInvoice && invoiceData.items.length > 0) {
        const invoiceItems = invoiceData.items.map(item => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
          
        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
        }
      }
      
      setInvoices([...invoices, invoiceData]);
      
      toast({
        title: "Invoice Created",
        description: "Your invoice has been created and saved.",
      });
    } catch (error) {
      console.error('Error in handleSaveInvoice:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceNumber: string) => {
    try {
      const { data: invoiceData, error: fetchError } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber)
        .single();
        
      if (fetchError) {
        console.error('Error fetching invoice:', fetchError);
        return;
      }
      
      if (invoiceData) {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoiceData.id);
          
        if (error) {
          console.error('Error deleting invoice:', error);
          toast({
            title: "Error",
            description: "Failed to delete invoice: " + error.message,
            variant: "destructive",
          });
          return;
        }
        
        const updatedInvoices = invoices.filter(invoice => invoice.invoiceNumber !== invoiceNumber);
        setInvoices(updatedInvoices);
        
        toast({
          title: "Invoice Deleted",
          description: "The invoice has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error('Error in handleDeleteInvoice:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSalaryEntry = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('salary_entries')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting salary entry:', error);
        toast({
          title: "Error",
          description: "Failed to delete salary entry: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      const updatedEntries = salaryEntries.filter(entry => entry.id !== id);
      setSalaryEntries(updatedEntries);
      
      toast({
        title: "Entry Deleted",
        description: "Salary entry has been deleted.",
      });
    } catch (error) {
      console.error('Error in handleDeleteSalaryEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleEditSalaryEntry = async (entry: SalaryEntry) => {
    if (!entry.id) return;
    
    setEditingSalaryEntry(entry);
    const updatedName = prompt("Enter new name:", entry.name);
    const updatedPurpose = prompt("Enter new purpose:", entry.purpose || "");
    const updatedAmount = prompt("Enter new amount:", entry.amount.toString());
    
    if (updatedName && updatedAmount) {
      try {
        const { error } = await supabase
          .from('salary_entries')
          .update({
            name: updatedName,
            purpose: updatedPurpose || entry.purpose,
            amount: parseFloat(updatedAmount)
          })
          .eq('id', entry.id);
          
        if (error) {
          console.error('Error updating salary entry:', error);
          toast({
            title: "Error",
            description: "Failed to update salary entry: " + error.message,
            variant: "destructive",
          });
          return;
        }
        
        const updatedEntries = salaryEntries.map(e => 
          e.id === entry.id 
            ? { 
                ...e, 
                name: updatedName, 
                purpose: updatedPurpose || e.purpose, 
                amount: parseFloat(updatedAmount) 
              } 
            : e
        );
        
        setSalaryEntries(updatedEntries);
        setEditingSalaryEntry(null);
        
        toast({
          title: "Entry Updated",
          description: "Salary entry has been updated successfully.",
        });
      } catch (error) {
        console.error('Error in handleEditSalaryEntry:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  const clearDebtFields = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }
      
      if (data) {
        const { error } = await supabase
          .from('profiles')
          .update({
            debt_principal: null,
            debt_interest_rate: null
          })
          .eq('id', data.id);
          
        if (error) {
          console.error('Error clearing debt fields:', error);
          toast({
            title: "Error",
            description: "Failed to clear debt data: " + error.message,
            variant: "destructive",
          });
          return;
        }
      }
      
      setDebtPrincipal("");
      setDebtInterestRate("");
      
      const updatedProfile = {
        ...profile,
        debtPrincipal: undefined,
        debtInterestRate: undefined
      };
      
      setProfile(updatedProfile);
      
      toast({
        title: "Debt Data Cleared",
        description: "Debt principal and interest rate have been cleared.",
      });
    } catch (error) {
      console.error('Error in clearDebtFields:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const exportSalaryEntriesToCSV = () => {
    if (salaryEntries.length === 0) {
      toast({
        title: "No entries to export",
        description: "There are no salary entries to export.",
        variant: "destructive",
      });
      return;
    }
    
    const headers = ["Name", "Date", "Purpose", "Amount"];
    const csvRows = [
      headers.join(","),
      ...salaryEntries.map(entry => 
        [
          `"${entry.name}"`,
          `"${entry.date}"`,
          `"${entry.purpose || ''}"`,
          entry.amount
        ].join(",")
      )
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `salary_entries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Salary entries have been exported to CSV.",
    });
  };

  const activeAccountName = currentAccount ? currentAccount.name : "No active account";

  if (isLoadingAccounts || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-foreground p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-3">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </header>
        
        <div className="mb-6">
          <nav className="flex space-x-1 border-b border-muted pb-px overflow-x-auto">
            <button
              onClick={() => setActiveSection('personal')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeSection === 'personal'
                  ? 'bg-background border-b-2 border-primary'
                  : 'hover:bg-muted/40'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveSection('accounts')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeSection === 'accounts'
                  ? 'bg-background border-b-2 border-primary'
                  : 'hover:bg-muted/40'
              }`}
            >
              Account Management
            </button>
            <button
              onClick={() => setActiveSection('features')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeSection === 'features'
                  ? 'bg-background border-b-2 border-primary'
                  : 'hover:bg-muted/40'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveSection('invoices')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeSection === 'invoices'
                  ? 'bg-background border-b-2 border-primary'
                  : 'hover:bg-muted/40'
              }`}
            >
              <span className="inline-block h-4 w-4 mr-1">📄</span>
              Invoice Flow
            </button>
          </nav>
        </div>
        
        {activeSection === 'personal' && (
          <PersonalInfoSection
            profile={profile}
            setProfile={setProfile}
            onSave={handleProfileUpdate}
          />
        )}
        
        {activeSection === 'accounts' && (
          <AccountsManagementSection
            accounts={accounts.map(acc => ({
              id: acc.id,
              name: acc.name,
              isActive: acc.isActive
            }))}
            activeAccountName={activeAccountName}
            onCreateAccount={handleCreateAccount}
            onDeleteAccount={handleDeleteAccount}
            onEditAccount={handleEditAccount}
            onSwitchAccount={handleSwitchAccount}
          />
        )}
        
        {activeSection === 'features' && (
          <FeaturesSection
            profile={profile}
            debtPrincipal={debtPrincipal}
            debtInterestRate={debtInterestRate}
            setProfile={setProfile}
            setDebtPrincipal={setDebtPrincipal}
            setDebtInterestRate={setDebtInterestRate}
            onToggleDebtFeature={handleToggleDebtFeature}
            onSaveChanges={handleProfileUpdate}
            onClearDebtFields={clearDebtFields}
          />
        )}
        
        {activeSection === 'invoices' && (
          <>
            <InvoicesSection
              invoices={invoices}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
            
            {salaryEntries.length > 0 && (
              <SalaryEntriesSection
                salaryEntries={salaryEntries}
                onDeleteSalaryEntry={handleDeleteSalaryEntry}
                onEditSalaryEntry={handleEditSalaryEntry}
                onExportEntries={exportSalaryEntriesToCSV}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
