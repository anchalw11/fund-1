-- =========================================
-- MIGRATE AFFILIATES TABLE TO USE referral_code
-- =========================================

-- Check current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'affiliates'
ORDER BY ordinal_position;

-- If affiliate_code exists but referral_code doesn't, rename the column
DO $$
BEGIN
    -- Check if affiliate_code exists and referral_code doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'affiliates' AND column_name = 'affiliate_code')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'affiliates' AND column_name = 'referral_code') THEN

        -- Rename affiliate_code to referral_code
        ALTER TABLE affiliates RENAME COLUMN affiliate_code TO referral_code;
        RAISE NOTICE '✅ Renamed affiliate_code to referral_code';

    ELSIF EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'affiliates' AND column_name = 'referral_code') THEN

        RAISE NOTICE '✅ referral_code column already exists';

    ELSE
        -- If neither exists, add referral_code column
        ALTER TABLE affiliates ADD COLUMN referral_code VARCHAR(50) UNIQUE;
        RAISE NOTICE '✅ Added referral_code column';
    END IF;
END $$;

-- Verify the table structure after migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'affiliates'
ORDER BY ordinal_position;

-- Update any NULL referral_codes with generated values
UPDATE affiliates
SET referral_code = UPPER(SUBSTRING(MD5(user_id::text || NOW()::text) FROM 1 FOR 10))
WHERE referral_code IS NULL OR referral_code = '';

-- Ensure all referral_codes are unique and not null
DO $$
DECLARE
    rec RECORD;
    new_code VARCHAR(50);
BEGIN
    FOR rec IN SELECT id, user_id, referral_code FROM affiliates WHERE referral_code IS NULL OR referral_code = '' LOOP
        -- Generate a unique code
        new_code := UPPER(SUBSTRING(MD5(rec.user_id::text || rec.id::text || NOW()::text) FROM 1 FOR 10));

        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM affiliates WHERE referral_code = new_code AND id != rec.id) LOOP
            new_code := UPPER(SUBSTRING(MD5(new_code || NOW()::text) FROM 1 FOR 10));
        END LOOP;

        UPDATE affiliates SET referral_code = new_code WHERE id = rec.id;
    END LOOP;

    RAISE NOTICE '✅ All referral codes generated and made unique';
END $$;

-- Add NOT NULL constraint if not already present
ALTER TABLE affiliates ALTER COLUMN referral_code SET NOT NULL;

-- Create unique index on referral_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliates_referral_code_unique ON affiliates(referral_code);

-- Final verification
SELECT
    COUNT(*) as total_affiliates,
    COUNT(CASE WHEN referral_code IS NOT NULL AND referral_code != '' THEN 1 END) as affiliates_with_codes,
    COUNT(DISTINCT referral_code) as unique_codes
FROM affiliates;

-- Show sample data
SELECT user_id, referral_code, commission_rate, status
FROM affiliates
LIMIT 5;
