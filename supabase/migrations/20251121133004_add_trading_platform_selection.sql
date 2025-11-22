/*
  # Add Trading Platform Selection
  
  1. Changes
    - Add `trading_platform` column to user_challenges table
    - Add `platform_fee` column to track additional fees for TradingView
    - Update the get_challenges_with_user_info function to include platform info
  
  2. Notes
    - MT5 is the default platform (no extra fee)
    - TradingView has additional fees:
      - $2 for challenges below $25,000 (equity type)
      - $6 for challenges $25,000 and above (equity type)
*/

-- Add trading_platform column to user_challenges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_challenges' AND column_name = 'trading_platform'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN trading_platform text DEFAULT 'mt5' CHECK (trading_platform IN ('mt5', 'tradingview'));
  END IF;
END $$;

-- Add platform_fee column to track additional fees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_challenges' AND column_name = 'platform_fee'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN platform_fee numeric(10, 2) DEFAULT 0.00;
  END IF;
END $$;

-- Update the get_challenges_with_user_info function to include platform
DROP FUNCTION IF EXISTS get_challenges_with_user_info();

CREATE OR REPLACE FUNCTION get_challenges_with_user_info()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  challenge_type text,
  challenge_type_id text,
  account_size numeric,
  amount_paid numeric,
  platform_fee numeric,
  trading_platform text,
  status text,
  trading_account_id text,
  trading_account_password text,
  trading_account_server text,
  credentials_sent boolean,
  purchase_date timestamptz,
  created_at timestamptz,
  user_email text,
  user_friendly_id text,
  user_first_name text,
  user_last_name text
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  is_admin boolean;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = current_user_id
  ) INTO is_admin;
  
  -- Only admins can call this function
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can access this function';
  END IF;
  
  -- Return challenges with user info
  RETURN QUERY
  SELECT 
    uc.id,
    uc.user_id,
    uc.challenge_type,
    uc.challenge_type_id,
    uc.account_size,
    uc.amount_paid,
    uc.platform_fee,
    COALESCE(uc.trading_platform, 'mt5') as trading_platform,
    uc.status,
    uc.trading_account_id,
    uc.trading_account_password,
    uc.trading_account_server,
    uc.credentials_sent,
    uc.purchase_date,
    uc.created_at,
    COALESCE(up.email, au.email, 'Unknown') as user_email,
    COALESCE(up.friendly_id, UPPER(SUBSTRING(uc.user_id::text, 1, 8))) as user_friendly_id,
    up.first_name as user_first_name,
    up.last_name as user_last_name
  FROM user_challenges uc
  LEFT JOIN user_profile up ON uc.user_id = up.user_id
  LEFT JOIN auth.users au ON uc.user_id = au.id
  ORDER BY COALESCE(uc.purchase_date, uc.created_at) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_challenges_with_user_info() TO authenticated;
