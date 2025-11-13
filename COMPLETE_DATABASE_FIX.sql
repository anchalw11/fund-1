-- ============================================================
-- COMPLETE DATABASE FIX - RUN THIS ONCE
-- Execute in Supabase SQL Editor
-- ============================================================
-- URL: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new
-- ============================================================

-- PART 1: Fix user_profile table and policies
-- ============================================================

-- Add missing columns
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

-- Drop ALL policies on user_profile
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profile') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profile';
    END LOOP;
END $$;

-- Drop ALL policies on admin_roles (if exists)
DO $$
DECLARE r RECORD;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_roles') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_roles') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON admin_roles';
        END LOOP;
    END IF;
END $$;

-- Reset RLS
ALTER TABLE user_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "profile_select" ON user_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profile_insert" ON user_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_update" ON user_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profile TO authenticated;
GRANT ALL ON user_profile TO service_role;

-- PART 2: Insert challenge types
-- ============================================================

-- Ensure RLS allows public read
DROP POLICY IF EXISTS "Public can view challenge types" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_select_public" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_public_read" ON challenge_types;

ALTER TABLE challenge_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_types_public_read"
  ON challenge_types FOR SELECT TO anon, authenticated USING (true);

-- Insert all challenge types
INSERT INTO challenge_types (
  type_name, challenge_code, challenge_name, display_name, description,
  phase_count, is_active, profit_split, max_daily_loss, max_total_loss,
  min_trading_days, time_limit_days, recommended, icon, color,
  phase1_profit_target, phase2_profit_target
) VALUES
('elite', 'ELITE_ROYAL', 'Elite Royal', 'Elite Royal', 
 'Premium trading challenge with the best profit split and flexible rules',
 2, true, 90.00, 5.00, 10.00, 4, NULL, true, 'Crown', 'purple', 8.00, 5.00),
('standard', 'CLASSIC_2STEP', 'Classic 2-Step', 'Classic 2-Step',
 'Traditional two-phase evaluation with balanced rules',
 2, true, 80.00, 5.00, 10.00, 4, NULL, true, 'Target', 'blue', 8.00, 5.00),
('rapid', 'RAPID_FIRE', 'Rapid Fire', 'Rapid Fire',
 'Fast-paced challenge for aggressive traders',
 1, true, 80.00, 5.00, 10.00, 0, 30, false, 'Zap', 'orange', 10.00, NULL),
('professional', 'PAYG_2STEP', 'Pay-As-You-Go', 'Pay-As-You-Go',
 'Flexible payment plan with monthly installments',
 2, true, 80.00, 5.00, 10.00, 4, NULL, false, 'CreditCard', 'green', 8.00, 5.00),
('swing', 'AGGRESSIVE_2STEP', 'Aggressive 2-Step', 'Aggressive 2-Step',
 'Higher targets for experienced traders',
 2, true, 80.00, 5.00, 10.00, 4, NULL, false, 'TrendingUp', 'red', 10.00, 5.00),
('scaling', 'SWING_PRO', 'Scaling Plan', 'Scaling Plan',
 'Start small and scale up your account size',
 1, true, 80.00, 5.00, 10.00, 0, NULL, false, 'BarChart', 'teal', 10.00, NULL)
ON CONFLICT (challenge_code) DO UPDATE SET
  type_name = EXCLUDED.type_name,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- PART 3: Verify everything
-- ============================================================

SELECT 'Step 1: User Profile Columns' as check_name, count(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'user_profile';

SELECT 'Step 2: Challenge Types' as check_name, count(*) as type_count
FROM challenge_types;

SELECT 'Step 3: User Profile Policies' as check_name, count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'user_profile';

SELECT '✅ DATABASE FIXED! Clear browser cache and retry payment flow.' as final_result;
