-- ============================================================
-- ULTIMATE FIX FOR INFINITE RECURSION + MISSING COLUMNS
-- Execute this in Supabase SQL Editor NOW
-- ============================================================
-- URL: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new
-- ============================================================

-- STEP 1: Add ALL missing columns to user_profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile' AND column_name = 'email') THEN
    ALTER TABLE user_profile ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile' AND column_name = 'friendly_id') THEN
    ALTER TABLE user_profile ADD COLUMN friendly_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_user_profile_friendly_id ON user_profile(friendly_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile' AND column_name = 'status') THEN
    ALTER TABLE user_profile ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile' AND column_name = 'kyc_status') THEN
    ALTER TABLE user_profile ADD COLUMN kyc_status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profile' AND column_name = 'email_verified') THEN
    ALTER TABLE user_profile ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- STEP 2: Drop ALL policies on user_profile
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profile') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profile';
    END LOOP;
END $$;

-- STEP 3: Drop ALL policies on admin_roles (if exists)
DO $$
DECLARE r RECORD;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_roles') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_roles') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON admin_roles';
        END LOOP;
    END IF;
END $$;

-- STEP 4: Reset RLS
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create simple policies
CREATE POLICY "profile_select" ON user_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profile_insert" ON user_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_update" ON user_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- STEP 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profile TO authenticated;
GRANT ALL ON user_profile TO service_role;

-- STEP 7: Fix admin_roles
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_roles') THEN
        ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
        ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "admin_simple" ON admin_roles FOR SELECT TO authenticated USING (user_id = auth.uid())';
    END IF;
END $$;

-- SUCCESS
SELECT 'FIXED! Clear browser cache and try again.' as result;
