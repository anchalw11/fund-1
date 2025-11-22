# CRITICAL FIX: User Profile Infinite Recursion Error

## Problem
When a user completes payment, the system tries to create a user profile but fails with:
```
Error: infinite recursion detected in policy for relation "admin_roles"
```

This is caused by RLS (Row Level Security) policies that recursively check the `admin_roles` table, creating an infinite loop.

## Solution
You MUST execute the SQL fix in your Supabase dashboard. Follow these steps:

### Step 1: Open Supabase SQL Editor
Go to: **https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new**

### Step 2: Copy and Execute This SQL

```sql
-- ============================================================
-- FIX: User Profile Infinite Recursion Error
-- ============================================================

-- Drop all existing problematic policies on user_profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profile;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profile;
DROP POLICY IF EXISTS "user_profile_select_own" ON user_profile;
DROP POLICY IF EXISTS "user_profile_insert_own" ON user_profile;
DROP POLICY IF EXISTS "user_profile_update_own" ON user_profile;

-- Disable and re-enable RLS to clean state
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies that use auth.uid() directly

-- Allow users to read their own profile
CREATE POLICY "user_profile_select_own"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile (during signup/payment)
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

-- Also add missing columns to support_tickets (for contact form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN user_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN user_name TEXT;
  END IF;
END $$;

-- Success message
SELECT 'All fixes applied successfully! User profile creation should now work.' as result;
```

### Step 3: Click "Run" or press Ctrl+Enter

### Step 4: Verify the Fix
After running the SQL, you should see a success message. The payment flow will now work properly, and users will be able to:
- Complete payment with FREETRIAL100 coupon
- Automatically create their user profile
- Access their dashboard

## What This Fixes

1. **Infinite Recursion Error**: Removes complex policies that reference admin_roles table
2. **User Profile Creation**: Allows authenticated users to insert their own profile
3. **Contact Form**: Adds missing columns for non-authenticated user submissions
4. **Security**: Maintains proper RLS - users can only access their own data

## After Running the SQL

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Try the payment flow again with coupon code: **FREETRIAL100**
3. User profile should be created automatically
4. You'll be redirected to the dashboard successfully

## Technical Details

The old policies were checking `admin_roles` table in a way that created circular references. The new policies use `auth.uid()` directly, which is provided by Supabase's auth system without any table lookups, eliminating the recursion issue.
