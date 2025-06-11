
-- Fix the database by ensuring only one account is active at a time
-- Set all accounts to inactive first
UPDATE accounts SET is_active = false;

-- Then set only the Personal Account as active using the ID from your screenshot
UPDATE accounts 
SET is_active = true 
WHERE id = '08ec1d70-2b10-4263-b7f7-4f5022a74efc';
