/*
  # Add Missing Columns to User Profile

  1. Changes
    - Add email column if missing
    - Add friendly_id column if missing
    - Add other essential columns
  
  2. Purpose
    - Support user profile creation during payment flow
    - Fix schema cache errors
*/

-- Add missing columns to user_profile
DO $$
BEGIN
  -- Add email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);
  END IF;

  -- Add friendly_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'friendly_id'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN friendly_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_user_profile_friendly_id ON user_profile(friendly_id);
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  -- Add kyc_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'kyc_status'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN kyc_status TEXT DEFAULT 'pending';
  END IF;

  -- Add email_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Drop problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profile;
DROP POLICY IF EXISTS "user_profile_select_own" ON user_profile;
DROP POLICY IF EXISTS "user_profile_insert_own" ON user_profile;
DROP POLICY IF EXISTS "user_profile_update_own" ON user_profile;

-- Disable and re-enable RLS
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create simple policies using auth.uid() directly (no recursion)
CREATE POLICY "user_profile_select"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_profile_insert"
  ON user_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profile_update"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profile TO authenticated;
GRANT ALL ON user_profile TO service_role;

SELECT 'All missing columns added and RLS policies fixed!' as result;
