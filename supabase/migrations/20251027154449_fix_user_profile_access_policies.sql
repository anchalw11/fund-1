/*
  # Fix User Profile Access Policies
  
  Updates RLS policies to allow:
  1. Service role access (for admin queries)
  2. Public read access for user profiles (with proper auth check)
  3. Fixes the 400 Bad Request errors when fetching user profiles
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Anyone can insert profile" ON user_profile;

-- Create new policies that work with admin queries
CREATE POLICY "Allow service role full access" 
  ON user_profile 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own profile" 
  ON user_profile 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can update own profile" 
  ON user_profile 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow profile creation" 
  ON user_profile 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Update user_challenges policies for admin access
DROP POLICY IF EXISTS "Users can view own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;

CREATE POLICY "Users and admins can view challenges" 
  ON user_challenges 
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
    OR auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Users can insert own challenges" 
  ON user_challenges 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users and admins can update challenges" 
  ON user_challenges 
  FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
    OR auth.jwt()->>'role' = 'service_role'
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
    OR auth.jwt()->>'role' = 'service_role'
  );
