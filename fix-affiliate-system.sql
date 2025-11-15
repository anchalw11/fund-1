-- =========================================
-- FUND8R AFFILIATE SYSTEM FIX SCRIPT
-- =========================================
-- This script ensures the affiliate system is properly set up in Supabase

-- 1. Check if affiliates table exists and has correct structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliates') THEN
        RAISE EXCEPTION 'affiliates table does not exist. Please run create-affiliates-table.sql first.';
    END IF;

    -- Check if referral_code column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'referral_code') THEN
        RAISE EXCEPTION 'referral_code column does not exist in affiliates table.';
    END IF;

    RAISE NOTICE '✓ Affiliates table exists with correct structure';
END $$;

-- 2. Create affiliate records for all existing users who don't have them
INSERT INTO affiliates (user_id, referral_code, commission_rate, total_referrals, total_earnings, status, created_at)
SELECT
    u.id as user_id,
    UPPER(SUBSTRING(MD5(u.id::text || NOW()::text) FROM 1 FOR 10)) as referral_code,
    10 as commission_rate,
    0 as total_referrals,
    0 as total_earnings,
    'active' as status,
    NOW() as created_at
FROM auth.users u
LEFT JOIN affiliates a ON u.id = a.user_id
WHERE a.user_id IS NULL;

-- 3. Verify the data
DO $$
DECLARE
    user_count INTEGER;
    affiliate_count INTEGER;
    missing_affiliates INTEGER;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Total users: %', user_count;

    -- Count affiliate records
    SELECT COUNT(*) INTO affiliate_count FROM affiliates;
    RAISE NOTICE 'Affiliate records: %', affiliate_count;

    -- Check for missing affiliates
    SELECT COUNT(*) INTO missing_affiliates
    FROM auth.users u
    LEFT JOIN affiliates a ON u.id = a.user_id
    WHERE a.user_id IS NULL;

    IF missing_affiliates > 0 THEN
        RAISE EXCEPTION 'Found % users without affiliate records', missing_affiliates;
    END IF;

    RAISE NOTICE '✓ All users have affiliate records';
END $$;

-- 4. Show sample affiliate data
SELECT
    u.email,
    a.referral_code,
    a.commission_rate,
    a.total_referrals,
    a.total_earnings,
    a.status,
    a.created_at
FROM auth.users u
JOIN affiliates a ON u.id = a.user_id
ORDER BY a.created_at DESC
LIMIT 10;

-- 5. Create index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- 6. Final verification
DO $$
DECLARE
    total_users INTEGER;
    total_affiliates INTEGER;
    active_affiliates INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_affiliates FROM affiliates;
    SELECT COUNT(*) INTO active_affiliates FROM affiliates WHERE status = 'active';

    RAISE NOTICE '=== AFFILIATE SYSTEM STATUS ===';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Total Affiliates: %', total_affiliates;
    RAISE NOTICE 'Active Affiliates: %', active_affiliates;

    IF total_users = total_affiliates AND active_affiliates = total_affiliates THEN
        RAISE NOTICE '✅ AFFILIATE SYSTEM IS FULLY OPERATIONAL';
    ELSE
        RAISE EXCEPTION '❌ AFFILIATE SYSTEM HAS ISSUES - Contact support';
    END IF;
END $$;
