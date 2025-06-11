
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSettings = () => {
  const [commission, setCommission] = useState(1.17);
  const [tax, setTax] = useState(1.17);
  const [showDebtFeature, setShowDebtFeature] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load profile settings from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
        
        if (!isMounted) return;
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setShowDebtFeature(data.show_debt_feature || false);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Load finance rates from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('finance_rates')
          .select('*')
          .limit(1)
          .single();
        
        if (!isMounted) return;
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching finance rates:', error);
          return;
        }
        
        if (data) {
          setCommission(data.commission || 1.17);
          setTax(data.tax || 1.17);
        }
      } catch (error) {
        console.error('Error in fetchRates:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchRates();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveDefaultRates = async (newCommission: number, newTax: number) => {
    if (newCommission <= 0 || newTax <= 0) {
      toast({
        title: "Error",
        description: "Commission and tax rates must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First try to get existing rates
      const { data: existingRates } = await supabase
        .from('finance_rates')
        .select('id')
        .limit(1)
        .single();
      
      let result;
      if (existingRates) {
        // Update existing rates
        result = await supabase
          .from('finance_rates')
          .update({ commission: newCommission, tax: newTax })
          .eq('id', existingRates.id);
      } else {
        // Create new rates record
        result = await supabase
          .from('finance_rates')
          .insert([{ commission: newCommission, tax: newTax }]);
      }
      
      if (result.error) {
        console.error('Error saving finance rates:', result.error);
        toast({
          title: "Error",
          description: "Failed to save default rates. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setCommission(newCommission);
      setTax(newTax);
      
      toast({
        title: "Default Rates Saved",
        description: "Commission and tax rates have been updated successfully."
      });
    } catch (error) {
      console.error('Error in handleSaveDefaultRates:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred when saving default rates.",
        variant: "destructive"
      });
    }
  };

  return {
    commission,
    tax,
    showDebtFeature,
    isLoading,
    handleSaveDefaultRates
  };
};
