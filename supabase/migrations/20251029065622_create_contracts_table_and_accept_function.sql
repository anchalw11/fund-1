/*
  # Create Contracts Table and Accept Function

  This migration creates:
  1. Contracts table for storing user contract acceptances
  2. accept_contract RPC function to handle contract acceptance
  3. Proper RLS policies for contracts
  4. Required columns in user_challenges table

  ## Tables
  - contracts: Stores contract acceptance records
  
  ## Functions  
  - accept_contract: Handles contract acceptance and credential release

  ## Security
  - RLS enabled with proper user access controls
  - Only authenticated users can accept contracts
  - Users can only view their own contracts
*/

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid,
  
  -- User Information
  full_name text,
  email text NOT NULL,
  date_of_birth date,
  country text,
  phone_number text,
  
  -- Contract Type
  contract_type text NOT NULL DEFAULT 'CHALLENGE_AGREEMENT',
  contract_version text NOT NULL DEFAULT '1.0',
  
  -- Challenge Details (snapshot at signing time)
  challenge_type text,
  account_size numeric,
  purchase_price numeric,
  profit_target numeric,
  max_daily_loss numeric,
  max_total_loss numeric,
  
  -- Agreements
  agree_terms boolean DEFAULT true,
  agree_risk_disclosure boolean DEFAULT true,
  agree_privacy_policy boolean DEFAULT true,
  agree_refund_policy boolean DEFAULT true,
  agree_trading_rules boolean DEFAULT true,
  agree_age_confirmation boolean DEFAULT true,
  agree_accurate_info boolean DEFAULT true,
  agree_anti_money_laundering boolean DEFAULT true,
  
  -- Signature Details
  electronic_signature text,
  signature_ip_address text NOT NULL,
  signature_user_agent text,
  signature_timestamp timestamptz NOT NULL DEFAULT now(),
  
  -- Contract Text
  contract_text text DEFAULT 'Fund8r Master Service Agreement',
  
  -- Status
  status text NOT NULL DEFAULT 'signed',
  
  -- PDF Storage
  pdf_url text,
  pdf_generated_at timestamptz,
  
  -- Timestamps
  signed_at timestamptz NOT NULL DEFAULT now(),
  voided_at timestamptz,
  terminated_at timestamptz,
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
  DROP POLICY IF EXISTS "Users can insert own contracts" ON contracts;
  DROP POLICY IF EXISTS "Admins can view all contracts" ON contracts;
  DROP POLICY IF EXISTS "Admins can update contracts" ON contracts;
  DROP POLICY IF EXISTS "contracts_select_own" ON contracts;
  DROP POLICY IF EXISTS "contracts_insert_auth" ON contracts;
END $$;

-- Create RLS policies
CREATE POLICY "contracts_select_own"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "contracts_insert_auth"
  ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add contract columns to user_challenges if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_challenges' AND column_name = 'contract_signed'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN contract_signed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_challenges' AND column_name = 'contract_id'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN contract_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_challenges' AND column_name = 'credentials_visible'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN credentials_visible boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_challenges' AND column_name = 'credentials_released_at'
  ) THEN
    ALTER TABLE user_challenges 
    ADD COLUMN credentials_released_at timestamptz;
  END IF;
END $$;

-- Create accept_contract function
CREATE OR REPLACE FUNCTION accept_contract(
  p_account_id text,
  p_ip_address text
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_challenge_id uuid;
  v_challenge_record RECORD;
  v_contract_id uuid;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Parse account_id (could be challenge ID or another identifier)
  -- Try to find the challenge
  BEGIN
    v_challenge_id := p_account_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- If not a UUID, try to find by other means
    SELECT id INTO v_challenge_id
    FROM user_challenges
    WHERE user_id = v_user_id
      AND contract_signed = false
    ORDER BY created_at DESC
    LIMIT 1;
  END;

  -- Get challenge details
  SELECT * INTO v_challenge_record
  FROM user_challenges
  WHERE id = v_challenge_id
    AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Challenge not found'
    );
  END IF;

  -- Check if already signed
  IF v_challenge_record.contract_signed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Contract already signed for this challenge'
    );
  END IF;

  -- Create contract record
  INSERT INTO contracts (
    user_id,
    challenge_id,
    email,
    challenge_type,
    account_size,
    signature_ip_address,
    contract_text,
    status
  ) VALUES (
    v_user_id,
    v_challenge_id,
    COALESCE(v_challenge_record.email, (SELECT email FROM auth.users WHERE id = v_user_id)),
    v_challenge_record.challenge_type,
    v_challenge_record.account_size,
    p_ip_address,
    'Fund8r Master Service Agreement - Electronically Signed',
    'signed'
  )
  RETURNING id INTO v_contract_id;

  -- Update challenge with contract info
  UPDATE user_challenges
  SET 
    contract_signed = true,
    contract_id = v_contract_id,
    credentials_visible = true,
    credentials_released_at = now()
  WHERE id = v_challenge_id;

  RETURN json_build_object(
    'success', true,
    'contract_id', v_contract_id,
    'message', 'Contract accepted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_contract(text, text) TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_challenge_id ON contracts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_signed_at ON contracts(signed_at DESC);