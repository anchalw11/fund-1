-- Create affiliates table in the NEW database
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
    affiliate_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    available_balance NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own affiliate data" ON affiliates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliate data" ON affiliates FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
