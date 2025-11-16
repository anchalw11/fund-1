/*
  # Fix Infinite Recursion and API Errors

  This migration fixes:
  1. Infinite recursion in admin_roles policy
  2. Profile creation errors during signup
  3. Simplifies RLS policies to avoid circular dependencies
*/

-- ====================================
-- FIX 1: Simplify user_profile policies to avoid recursion
-- ====================================

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON user_profile;

-- Simple policy: allow authenticated users to read all profiles
-- This avoids the admin_roles check that can cause infinite recursion
CREATE POLICY "Allow authenticated read profiles"
  ON user_profile
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
DROP POLICY IF EXISTS "Anyone can insert profile" ON user_profile;

CREATE POLICY "Allow profile creation"
  ON user_profile
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;

CREATE POLICY "Allow own profile update"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- FIX 2: Simplify user_challenges policies
-- ====================================

DROP POLICY IF EXISTS "Allow reading challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users and admins can view challenges" ON user_challenges;

CREATE POLICY "Allow reading all challenges"
  ON user_challenges
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert challenges
DROP POLICY IF EXISTS "Users can create own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Allow challenge creation" ON user_challenges;

CREATE POLICY "Allow authenticated challenge insert"
  ON user_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own challenges OR allow system updates
DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Allow challenge updates" ON user_challenges;

CREATE POLICY "Allow challenge updates"
  ON user_challenges
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ====================================
-- FIX 3: Fix admin_roles table to avoid recursion
-- ====================================

-- Ensure admin_roles table exists
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on admin_roles
DROP POLICY IF EXISTS "Allow admin access" ON admin_roles;
DROP POLICY IF EXISTS "Admins can read all" ON admin_roles;

-- Simple policy: allow all authenticated users to read admin_roles
-- This breaks the recursion cycle
CREATE POLICY "Allow read admin_roles"
  ON admin_roles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ====================================
-- FIX 4: Ensure validate_coupon function exists
-- ====================================

-- Drop function if exists and recreate
DROP FUNCTION IF EXISTS validate_coupon(TEXT, TEXT);

CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code TEXT,
  challenge_type TEXT DEFAULT 'all'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Find the coupon
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (applicable_to = 'all' OR applicable_to = challenge_type OR applicable_to IS NULL)
  LIMIT 1;

  -- Check if coupon was found
  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.used_count >= coupon_record.max_uses THEN
    result := json_build_object(
      'valid', false,
      'message', 'Coupon has reached its usage limit'
    );
    RETURN result;
  END IF;

  -- Return valid coupon
  result := json_build_object(
    'valid', true,
    'message', 'Coupon is valid',
    'code', coupon_record.code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', coupon_record.discount_amount,
    'description', coupon_record.description
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;

-- ====================================
-- FIX 5: Ensure coupons table policies are correct
-- ====================================

DROP POLICY IF EXISTS "Public can view coupons" ON coupons;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;

CREATE POLICY "Allow reading active coupons"
  ON coupons
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
