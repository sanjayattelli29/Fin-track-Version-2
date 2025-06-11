
-- Fix the switch_to_account function to include proper WHERE clauses
CREATE OR REPLACE FUNCTION public.switch_to_account(target_account_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_info record;
  result json;
BEGIN
  -- First, set all accounts to inactive (with proper WHERE clause)
  UPDATE public.accounts 
  SET is_active = false
  WHERE is_active = true;
  
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
