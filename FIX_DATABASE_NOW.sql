-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- 1. Fix user_profile columns
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS friendly_id TEXT;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profile_friendly_id ON user_profile(friendly_id);

-- 2. Drop ALL user_profile policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profile') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profile';
    END LOOP;
END $$;

-- 3. Create simple policies
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "up_sel" ON user_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "up_ins" ON user_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "up_upd" ON user_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4. Challenge types RLS
ALTER TABLE challenge_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view challenge types" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_select_public" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_public_read" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_read_all" ON challenge_types;
CREATE POLICY "ct_read" ON challenge_types FOR SELECT TO anon, authenticated USING (true);

-- 5. Insert challenge types
INSERT INTO challenge_types (type_name, challenge_code, challenge_name, display_name, description, phase_count, is_active, profit_split, max_daily_loss, max_total_loss, min_trading_days, time_limit_days, recommended, icon, color, phase1_profit_target, phase2_profit_target) VALUES
('elite', 'ELITE_ROYAL', 'Elite Royal', 'Elite Royal', 'Premium challenge', 2, true, 90, 5, 10, 4, NULL, true, 'Crown', 'purple', 8, 5),
('standard', 'CLASSIC_2STEP', 'Classic 2-Step', 'Classic 2-Step', 'Standard challenge', 2, true, 80, 5, 10, 4, NULL, true, 'Target', 'blue', 8, 5),
('rapid', 'RAPID_FIRE', 'Rapid Fire', 'Rapid Fire', 'Fast challenge', 1, true, 80, 5, 10, 0, 30, false, 'Zap', 'orange', 10, NULL),
('professional', 'PAYG_2STEP', 'Pay-As-You-Go', 'Pay-As-You-Go', 'Pay as you go', 2, true, 80, 5, 10, 4, NULL, false, 'CreditCard', 'green', 8, 5),
('swing', 'AGGRESSIVE_2STEP', 'Aggressive 2-Step', 'Aggressive 2-Step', 'Aggressive', 2, true, 80, 5, 10, 4, NULL, false, 'TrendingUp', 'red', 10, 5),
('scaling', 'SWING_PRO', 'Scaling Plan', 'Scaling Plan', 'Scaling', 1, true, 80, 5, 10, 0, NULL, false, 'BarChart', 'teal', 10, NULL)
ON CONFLICT (challenge_code) DO NOTHING;

SELECT 'FIXED! Refresh browser.' as result;
