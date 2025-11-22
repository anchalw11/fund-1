-- ===========================================
-- AFFILIATE CODE GENERATION FIX SQL SCRIPT
-- ===========================================
-- This script ensures affiliate codes are properly generated and stored in the database
-- and provides automatic assignment for all existing users

-- 1. Create or update the affiliates table with proper structure
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate NUMERIC(5,2) DEFAULT 10.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0,
    available_balance NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5. Add missing columns to existing affiliates table if they don't exist
DO $$
BEGIN
    -- Add available_balance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'available_balance') THEN
        ALTER TABLE affiliates ADD COLUMN available_balance NUMERIC(10,2) DEFAULT 0;
        RAISE NOTICE 'Added available_balance column to affiliates table';
    END IF;

    -- Add total_earnings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'total_earnings') THEN
        ALTER TABLE affiliates ADD COLUMN total_earnings NUMERIC(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total_earnings column to affiliates table';
    END IF;

    -- Add commission_rate column if it doesn't exist (with default)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'commission_rate') THEN
        ALTER TABLE affiliates ADD COLUMN commission_rate NUMERIC(5,2) DEFAULT 10.00;
        RAISE NOTICE 'Added commission_rate column to affiliates table';
    END IF;

    -- Add total_referrals column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'total_referrals') THEN
        ALTER TABLE affiliates ADD COLUMN total_referrals INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_referrals column to affiliates table';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'status') THEN
        ALTER TABLE affiliates ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
        RAISE NOTICE 'Added status column to affiliates table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'updated_at') THEN
        ALTER TABLE affiliates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to affiliates table';
    END IF;
END $$;

-- 2. Create related tables if they don't exist
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    purchase_amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts_affiliate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    notes TEXT
);

-- 3. Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts_affiliate ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for affiliates table
DROP POLICY IF EXISTS "Users can view own affiliate data" ON affiliates;
CREATE POLICY "Users can view own affiliate data" ON affiliates
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own affiliate data" ON affiliates;
CREATE POLICY "Users can update own affiliate data" ON affiliates
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
CREATE POLICY "Service role can manage affiliates" ON affiliates
    FOR ALL
    TO service_role
    USING (true);

-- 5. Create RLS Policies for affiliate_referrals table
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON affiliate_referrals;
CREATE POLICY "Affiliates can view own referrals" ON affiliate_referrals
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM affiliates WHERE id = affiliate_referrals.affiliate_id
    ));

DROP POLICY IF EXISTS "Service role can manage referrals" ON affiliate_referrals;
CREATE POLICY "Service role can manage referrals" ON affiliate_referrals
    FOR ALL
    TO service_role
    USING (true);

-- 6. Create RLS Policies for payouts_affiliate table
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON payouts_affiliate;
CREATE POLICY "Affiliates can view own payouts" ON payouts_affiliate
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id FROM affiliates WHERE id = payouts_affiliate.affiliate_id
    ));

DROP POLICY IF EXISTS "Service role can manage payouts" ON payouts_affiliate;
CREATE POLICY "Service role can manage payouts" ON payouts_affiliate
    FOR ALL
    TO service_role
    USING (true);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_affiliate_affiliate_id ON payouts_affiliate(affiliate_id);

-- 8. Create function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION generate_affiliate_code(user_id UUID DEFAULT NULL)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code VARCHAR(50);
    counter INTEGER := 0;
    base_name TEXT;
BEGIN
    -- If user_id provided, try to generate name-based code first
    IF user_id IS NOT NULL THEN
        SELECT COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
        INTO base_name
        FROM auth.users
        WHERE id = user_id;

        -- Generate name-based code
        IF base_name IS NOT NULL THEN
            -- Take first 2-3 letters of first name and last name
            WITH name_parts AS (
                SELECT
                    UPPER(TRIM(split_part(TRIM(base_name), ' ', 1))) as first_name,
                    UPPER(TRIM(split_part(TRIM(base_name), ' ', array_length(string_to_array(TRIM(base_name), ' '), 1)))) as last_name
            )
            SELECT
                CASE
                    WHEN first_name = '' OR last_name = '' THEN 'USER'
                    WHEN LENGTH(CONCAT(LEFT(first_name, 2), LEFT(last_name, 2))) >= 4 THEN LEFT(CONCAT(LEFT(first_name, 2), LEFT(last_name, 2)), 4)
                    ELSE CONCAT(LEFT(first_name, 2), LEFT(last_name, 2))
                END
            INTO base_name
            FROM name_parts;

            base_name := REGEXP_REPLACE(base_name, '[^A-Z0-9]', '', 'g');
        END IF;
    END IF;

    -- If no base_name or it's too short, use USER prefix
    IF base_name IS NULL OR LENGTH(base_name) < 2 THEN
        base_name := 'USER';
    END IF;

    -- Generate unique code by adding numbers
    LOOP
        IF counter = 0 THEN
            code := base_name;
        ELSE
            code := base_name || counter::TEXT;
        END IF;

        EXIT WHEN NOT EXISTS (SELECT 1 FROM affiliates WHERE referral_code = code);
        counter := counter + 1;

        -- Safety check to prevent infinite loop
        IF counter > 10000 THEN
            -- Fallback to random hash
            code := 'AFF' || ENCODE(gen_random_bytes(6), 'hex');
            EXIT;
        END IF;
    END LOOP;

    RETURN code;
END;
$$;

-- 9. Create function to create affiliate for new user
CREATE OR REPLACE FUNCTION create_affiliate_for_user(new_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affiliate_id UUID;
BEGIN
    -- Check if affiliate already exists
    SELECT id INTO affiliate_id
    FROM affiliates
    WHERE user_id = new_user_id;

    IF affiliate_id IS NOT NULL THEN
        RETURN affiliate_id;
    END IF;

    -- Create new affiliate with generated code
    INSERT INTO affiliates (
        user_id,
        referral_code,
        commission_rate,
        total_referrals,
        total_earnings,
        available_balance,
        status
    ) VALUES (
        new_user_id,
        generate_affiliate_code(new_user_id),
        10.00,
        0,
        0,
        0,
        'active'
    )
    RETURNING id INTO affiliate_id;

    RETURN affiliate_id;
END;
$$;

-- 10. Create function to record purchase and award commission
CREATE OR REPLACE FUNCTION record_affiliate_purchase(
    referral_code_param TEXT,
    user_id_param UUID,
    purchase_amount_param NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affiliate_record RECORD;
    commission_amount NUMERIC;
    referral_id UUID;
    result JSON;
BEGIN
    -- Find affiliate by referral code
    SELECT * INTO affiliate_record
    FROM affiliates
    WHERE referral_code = referral_code_param AND status = 'active';

    IF affiliate_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Invalid referral code');
    END IF;

    -- Calculate commission (10% for now, can be made dynamic)
    commission_amount := purchase_amount_param * (affiliate_record.commission_rate / 100);

    -- Create referral record
    INSERT INTO affiliate_referrals (
        affiliate_id,
        referred_user_id,
        purchase_amount,
        commission_amount,
        commission_rate,
        status
    ) VALUES (
        affiliate_record.id,
        user_id_param,
        purchase_amount_param,
        commission_amount,
        affiliate_record.commission_rate,
        'completed'
    )
    RETURNING id INTO referral_id;

    -- Update affiliate earnings
    UPDATE affiliates
    SET
        total_earnings = total_earnings + commission_amount,
        available_balance = available_balance + commission_amount,
        total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE id = affiliate_record.id;

    RETURN json_build_object(
        'success', true,
        'referral_id', referral_id,
        'commission_amount', commission_amount,
        'affiliate_id', affiliate_record.id
    );
END;
$$;

-- 11. Create trigger to automatically assign affiliate codes to new users
CREATE OR REPLACE FUNCTION trigger_create_affiliate_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create affiliate record for new user
    PERFORM create_affiliate_for_user(NEW.id);

    RETURN NEW;
END;
$$;

-- Drop the trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS create_affiliate_on_user_insert ON auth.users;

-- Create the trigger
CREATE TRIGGER create_affiliate_on_user_insert
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_affiliate_for_new_user();

-- 12. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at
    BEFORE UPDATE ON affiliates
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_updated_at();

-- 13. Assign affiliate codes to existing users who don't have them
INSERT INTO affiliates (
    user_id,
    referral_code,
    commission_rate,
    total_referrals,
    total_earnings,
    available_balance,
    status
)
SELECT
    u.id,
    generate_affiliate_code(u.id),
    10.00,
    0,
    0,
    0,
    'active'
FROM auth.users u
LEFT JOIN affiliates a ON u.id = a.user_id
WHERE a.id IS NULL;

-- 14. Verify the assignment worked
DO $$
DECLARE
    total_users INTEGER;
    total_affiliates INTEGER;
    codes_generated INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_affiliates FROM affiliates;
    SELECT COUNT(DISTINCT referral_code) INTO codes_generated FROM affiliates WHERE referral_code IS NOT NULL;

    RAISE NOTICE 'AFFILIATE CODE GENERATION REPORT:';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Total Affiliates: %', total_affiliates;
    RAISE NOTICE 'Codes Generated: %', codes_generated;
    RAISE NOTICE 'Coverage: %%%', ROUND((total_affiliates::NUMERIC / NULLIF(total_users, 0)::NUMERIC) * 100, 2);

    -- Check for any null or empty codes
    IF EXISTS (SELECT 1 FROM affiliates WHERE referral_code IS NULL OR referral_code = '') THEN
        RAISE WARNING 'WARNING: Found % users with NULL or empty affiliate codes!', (
            SELECT COUNT(*) FROM affiliates WHERE referral_code IS NULL OR referral_code = ''
        );
    ELSE
        RAISE NOTICE 'SUCCESS: All affiliate codes are properly assigned!';
    END IF;
END $$;

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON affiliates TO service_role;
GRANT ALL ON affiliate_referrals TO service_role;
GRANT ALL ON payouts_affiliate TO service_role;
GRANT SELECT ON affiliates TO authenticated;
GRANT SELECT ON affiliate_referrals TO authenticated;
GRANT SELECT ON payouts_affiliate TO authenticated;

-- 16. Add helpful comments
COMMENT ON TABLE affiliates IS 'Stores affiliate program information for users';
COMMENT ON TABLE affiliate_referrals IS 'Tracks referrals and commissions earned by affiliates';
COMMENT ON TABLE payouts_affiliate IS 'Manages affiliate payout requests and processing';

COMMENT ON COLUMN affiliates.referral_code IS 'Unique code used for referral links and tracking';
COMMENT ON COLUMN affiliates.commission_rate IS 'Percentage commission rate for referrals (e.g., 10.00 for 10%)';
COMMENT ON COLUMN affiliates.available_balance IS 'Current available balance for payouts';

-- FINAL SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 AFFILIATE SYSTEM SETUP COMPLETE!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ Affiliates table created/updated';
    RAISE NOTICE '✅ Related tables (referrals, payouts) created';
    RAISE NOTICE '✅ Security policies and RLS enabled';
    RAISE NOTICE '✅ Code generation functions created';
    RAISE NOTICE '✅ Automatic assignment triggers activated';
    RAISE NOTICE '✅ All existing users assigned affiliate codes';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run this script in your Supabase SQL editor';
    RAISE NOTICE '2. Test the affiliate creation API: /api/affiliates/create';
    RAISE NOTICE '3. Verify affiliate codes appear in the dashboard';
    RAISE NOTICE '4. The "LOADING" fallback issue should now be resolved!';
END $$;
