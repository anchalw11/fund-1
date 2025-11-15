/*
  # Complete Fund8r Schema Setup
  
  Creates all essential tables for the Fund8r trading platform:
  1. user_profile - User information and profiles
  2. challenge_types - Available challenge configurations  
  3. challenge_pricing - Pricing for each challenge type
  4. user_challenges - User's purchased challenges
  5. payments - Payment records
  6. downloads - Certificates and invoices
  7. coupons - Discount coupons
  8. email_verifications - Email verification system
  9. mt5_accounts - MT5 trading accounts
  10. admin_roles - Admin permissions
  11. affiliates - Affiliate system
  12. support_tickets - Support system
  13. notifications - User notifications
  14. payouts - Payout requests
  15. daily_stats - Performance tracking
*/

-- ============================================================
-- 1. USER_PROFILE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profile (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    friendly_id TEXT UNIQUE,
    country TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'active'
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON user_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can insert profile" ON user_profile FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- ============================================================
-- 2. CHALLENGE_TYPES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS challenge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name TEXT UNIQUE NOT NULL,
    challenge_code TEXT UNIQUE,
    challenge_name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    phase_count INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    profit_split DECIMAL(5,2) DEFAULT 80.00,
    max_daily_loss DECIMAL(5,2) DEFAULT 5.00,
    max_total_loss DECIMAL(5,2) DEFAULT 10.00,
    min_trading_days INTEGER DEFAULT 4,
    time_limit_days INTEGER DEFAULT 60,
    recommended BOOLEAN DEFAULT FALSE,
    icon TEXT,
    color TEXT,
    phase1_profit_target DECIMAL(5,2) DEFAULT 8.00,
    phase2_profit_target DECIMAL(5,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE challenge_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge types" ON challenge_types FOR SELECT TO authenticated, anon USING (is_active = TRUE);

-- Insert default challenge types
INSERT INTO challenge_types (type_name, challenge_code, challenge_name, display_name, description, phase_count, profit_split, recommended, icon, color, phase1_profit_target, phase2_profit_target) VALUES
  ('elite', 'ELITE_ROYAL', 'Elite Royal', 'Elite Royal', 'Premium challenge with 90% profit split', 2, 90.00, FALSE, 'award', 'gold', 8.00, 5.00),
  ('standard', 'CLASSIC_2STEP', 'Classic 2-Step', 'Classic 2-Step', 'Traditional 2-phase evaluation', 2, 80.00, TRUE, 'trophy', 'blue', 8.00, 5.00),
  ('rapid', 'RAPID_FIRE', 'Rapid Fire', 'Rapid Fire', 'Fast 1-step challenge', 1, 80.00, FALSE, 'zap', 'orange', 10.00, NULL),
  ('professional', 'PAYG_2STEP', 'Pay-As-You-Go', 'Pay-As-You-Go', 'Pay for each phase separately', 2, 80.00, FALSE, 'credit-card', 'green', 8.00, 5.00),
  ('swing', 'AGGRESSIVE_2STEP', 'Aggressive', 'Aggressive 2-Step', 'Higher targets, more risk', 2, 80.00, FALSE, 'flame', 'red', 10.00, 5.00),
  ('scaling', 'SWING_PRO', 'Scaling Plan', 'Scaling Plan', 'Scale account size with performance', 2, 80.00, FALSE, 'trending-up', 'purple', 8.00, 5.00)
ON CONFLICT (type_name) DO NOTHING;

-- ============================================================
-- 3. USER_CHALLENGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL,
    challenge_type_id UUID REFERENCES challenge_types(id),
    account_size NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_id UUID,
    discount_applied BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    current_phase INTEGER DEFAULT 1,
    phase_2_paid BOOLEAN DEFAULT FALSE,
    phase_2_price NUMERIC(10,2),
    trading_account_id TEXT,
    trading_account_password TEXT,
    trading_account_server TEXT,
    credentials_sent BOOLEAN DEFAULT FALSE,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" ON user_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON user_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON user_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. DOWNLOADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    document_number TEXT,
    file_path TEXT,
    file_url TEXT,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    challenge_type TEXT,
    account_size NUMERIC(15,2),
    amount NUMERIC(10,2),
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    auto_generated BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own downloads" ON downloads FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. COUPONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC(5,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    challenge_type_restriction TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT TO authenticated, anon USING (is_active = TRUE);

-- Insert default coupons
INSERT INTO coupons (coupon_code, discount_percent, max_uses, is_active) VALUES
  ('FREETRIAL100', 100, 1000, TRUE),
  ('WELCOME50', 50, NULL, TRUE)
ON CONFLICT (coupon_code) DO NOTHING;

-- ============================================================
-- 7. EMAIL_VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert verifications" ON email_verifications FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- ============================================================
-- 8. CHALLENGE_PRICING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS challenge_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_type TEXT NOT NULL,
    challenge_type_id UUID REFERENCES challenge_types(id),
    account_size NUMERIC(15,2) NOT NULL,
    phase_1_price NUMERIC(10,2) NOT NULL,
    phase_2_price NUMERIC(10,2),
    regular_price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2) NOT NULL,
    platform_cost NUMERIC(10,2) DEFAULT 0,
    daily_dd_pct DECIMAL(5,2) DEFAULT 5.00,
    max_dd_pct DECIMAL(5,2) DEFAULT 10.00,
    min_trading_days INTEGER DEFAULT 4,
    time_limit_days INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_type, account_size)
);

ALTER TABLE challenge_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing" ON challenge_pricing FOR SELECT TO authenticated, anon USING (is_active = TRUE);

-- Insert default pricing
INSERT INTO challenge_pricing (challenge_type, account_size, phase_1_price, phase_2_price, regular_price, discount_price, platform_cost) VALUES
  ('standard', 5000, 49.00, 29.00, 98.00, 49.00, 10.00),
  ('standard', 10000, 99.00, 49.00, 198.00, 99.00, 15.00),
  ('standard', 25000, 199.00, 99.00, 398.00, 199.00, 25.00),
  ('standard', 50000, 299.00, 149.00, 598.00, 299.00, 35.00),
  ('standard', 100000, 499.00, 249.00, 998.00, 499.00, 50.00),
  ('standard', 200000, 899.00, 449.00, 1798.00, 899.00, 75.00)
ON CONFLICT (challenge_type, account_size) DO NOTHING;

-- ============================================================
-- 9. MT5_ACCOUNTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS mt5_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id),
    challenge_id UUID REFERENCES user_challenges(id),
    account_number TEXT NOT NULL,
    password TEXT NOT NULL,
    server TEXT NOT NULL,
    balance NUMERIC(15,2),
    equity NUMERIC(15,2),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mt5_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MT5 accounts" ON mt5_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 10. ADMIN_ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles" ON admin_roles FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- ============================================================
-- 11. AFFILIATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) UNIQUE,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate data" ON affiliates FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 12. SUPPORT_TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 14. PAYOUTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id),
    challenge_id UUID REFERENCES user_challenges(id),
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_details JSONB,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    notes TEXT
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON payouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create payout requests" ON payouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 15. DAILY_STATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    starting_balance NUMERIC(15,2),
    ending_balance NUMERIC(15,2),
    daily_profit_loss NUMERIC(15,2),
    daily_loss_percent NUMERIC(5,2),
    trades_opened INTEGER DEFAULT 0,
    trades_closed INTEGER DEFAULT 0,
    is_trading_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, date)
);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stats for own challenges" ON daily_stats FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM user_challenges WHERE user_challenges.id = daily_stats.challenge_id AND user_challenges.user_id = auth.uid())
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_type ON user_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_accounts_user_id ON mt5_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code);
