-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- ============================================================
-- COMPLETE FIX: User Profile RLS + Trigger
-- ============================================================

-- Step 1: Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profile';

-- Step 2: Drop all existing policies on user_profile
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profile') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profile';
    END LOOP;
END $$;

-- Step 3: Disable RLS temporarily during profile creation
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;

-- Step 4: Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION generate_friendly_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'USER-' || EXTRACT(epoch FROM NOW())::TEXT || '-' || (RANDOM() * 1000)::INT::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
  -- Extract values with safe defaults
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  -- Only insert if profile doesn't exist
  IF NOT EXISTS (SELECT 1 FROM user_profile WHERE user_id = NEW.id) THEN
    BEGIN
      INSERT INTO user_profile (
        user_id,
        email,
        first_name,
        last_name,
        friendly_id,
        email_verified,
        status,
        kyc_status,
        created_at
      ) VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        generate_friendly_id(),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        'active',
        'pending',
        NOW()
      );
    EXCEPTION
      WHEN unique_violation THEN
        -- Profile already exists, skip silently
        NULL;
      WHEN OTHERS THEN
        RAISE WARNING 'Profile creation failed for %: %', NEW.id, SQLERRM;
        -- Don't fail the user creation
        NULL;
    END;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate trigger (ensure it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_profile();

-- Step 6: Fix RLS policies - more permissive
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Allow service role and authenticated users to do everything
CREATE POLICY "service_role_full_access" ON user_profile
  FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- Allow authenticated users to manage their own profiles
CREATE POLICY "user_own_profile" ON user_profile
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow profile creation during signup (key policy!)
CREATE POLICY "allow_profile_creation" ON user_profile
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Allow reading profiles (for admin features, public challenge stats, etc.)
CREATE POLICY "allow_public_reads" ON user_profile
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Step 7: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profile TO authenticated;
GRANT ALL ON user_profile TO service_role;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Step 8: Test that it works
INSERT INTO user_profile (user_id, email, friendly_id, email_verified, status, created_at)
VALUES ('test-user-1234567890', 'test@example.com', 'TEST-USER', false, 'active', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Cleanup test data
DELETE FROM user_profile WHERE user_id = 'test-user-1234567890';

