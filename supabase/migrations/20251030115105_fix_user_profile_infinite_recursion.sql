/*
  # Fix Infinite Recursion in User Profile RLS Policies

  1. Problem
    - Current user_profile policies cause infinite recursion when checking admin_roles
    - This prevents user creation after payment completion
  
  2. Solution
    - Drop existing problematic policies
    - Create simple, non-recursive policies that use auth.uid() directly
    - Allow authenticated users to read/insert/update their own profile
    - Admin access will be handled separately without recursion
  
  3. Security
    - Users can only access their own profile data
    - No infinite recursion through admin_roles checks
    - Service role key bypasses RLS for admin operations
*/

-- Drop all existing policies on user_profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profile;

-- Disable RLS temporarily to clean up
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Allow users to read their own profile
CREATE POLICY "user_profile_select_own"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "user_profile_insert_own"
  ON user_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "user_profile_update_own"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profile TO authenticated;
GRANT ALL ON user_profile TO service_role;
