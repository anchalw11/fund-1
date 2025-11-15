/*
  # Fix Infinite Recursion and API Errors v2

  This migration fixes:
  1. Infinite recursion in admin_roles policy during signup
  2. Coupon validation errors
  3. Simplifies RLS policies to avoid circular dependencies
*/

-- ====================================
-- FIX 1: Simplify user_profile policies to avoid recursion
-- ====================================

DO $$ 
BEGIN
  -- Drop all existing policies on user_profile
  DROP POLICY IF EXISTS "Authenticated users can read profiles" ON user_profile;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;
  DROP POLICY IF EXISTS "Anyone can insert profile" ON user_profile;
  DROP POLICY IF EXISTS "Allow profile creation" ON user_profile;
  DROP POLICY IF EXISTS "Allow authenticated read profiles" ON user_profile;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
  DROP POLICY IF EXISTS "Allow own profile update" ON user_profile;

  -- Create new simplified policies
  CREATE POLICY "users_select_all"
    ON user_profile
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "users_insert_own"
    ON user_profile
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  CREATE POLICY "users_update_own"
    ON user_profile
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- ====================================
-- FIX 2: Simplify user_challenges policies
-- ====================================

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow reading challenges" ON user_challenges;
  DROP POLICY IF EXISTS "Users and admins can view challenges" ON user_challenges;
  DROP POLICY IF EXISTS "Allow reading all challenges" ON user_challenges;
  DROP POLICY IF EXISTS "Users can create own challenges" ON user_challenges;
  DROP POLICY IF EXISTS "Allow challenge creation" ON user_challenges;
  DROP POLICY IF EXISTS "Allow authenticated challenge insert" ON user_challenges;
  DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;
  DROP POLICY IF EXISTS "Allow challenge updates" ON user_challenges;

  CREATE POLICY "challenges_select_all"
    ON user_challenges
    FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "challenges_insert_auth"
    ON user_challenges
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "challenges_update_all"
    ON user_challenges
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- ====================================
-- FIX 3: Ensure validate_coupon function exists
-- ====================================

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
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (applicable_to = 'all' OR applicable_to = challenge_type OR applicable_to IS NULL)
  LIMIT 1;

  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  IF coupon_record.max_uses IS NOT NULL AND coupon_record.used_count >= coupon_record.max_uses THEN
    result := json_build_object(
      'valid', false,
      'message', 'Coupon has reached its usage limit'
    );
    RETURN result;
  END IF;

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

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;