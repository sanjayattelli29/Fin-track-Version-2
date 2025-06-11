
-- Create a switch_account function to handle account switching logic
CREATE OR REPLACE FUNCTION public.switch_to_account(target_account_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_info record;
  result json;
BEGIN
  -- First, set all accounts to inactive
  UPDATE public.accounts 
  SET is_active = false;
  
  -- Then set the target account as active
  UPDATE public.accounts 
  SET is_active = true 
  WHERE id = target_account_id;
  
  -- Get the account information
  SELECT id, name, is_active 
  INTO account_info 
  FROM public.accounts 
  WHERE id = target_account_id;
  
  -- Return account info as JSON
  result := json_build_object(
    'id', account_info.id,
    'name', account_info.name,
    'is_active', account_info.is_active,
    'switched_at', now()
  );
  
  RETURN result;
END;
$$;

-- Add foreign key constraints to ensure data isolation per account
-- Update transactions table to properly link to accounts
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_account 
FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Update salary_entries to link to transactions (which are account-specific)
ALTER TABLE public.salary_entries 
ADD CONSTRAINT fk_salary_entries_transaction 
FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

-- Create indexes for better performance when querying by account
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_salary_entries_transaction_id ON public.salary_entries(transaction_id);

-- Create a view for account-specific data summary
CREATE OR REPLACE VIEW public.account_summary AS
SELECT 
  a.id as account_id,
  a.name as account_name,
  a.is_active,
  COALESCE(SUM(t.earnings), 0) as total_earnings,
  COALESCE(SUM(t.spending), 0) as total_spending,
  COALESCE(SUM(t.investment), 0) as total_investment,
  COALESCE(SUM(t.salary), 0) as total_salary,
  COUNT(t.id) as transaction_count
FROM public.accounts a
LEFT JOIN public.transactions t ON a.id = t.account_id
GROUP BY a.id, a.name, a.is_active;
