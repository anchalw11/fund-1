-- ===================================================
-- Database Migration: Rename referral_code to affiliate_code
-- ===================================================

-- This migration fixes the column name mismatch between database and frontend
-- Frontend expects 'affiliate_code' but database has 'referral_code'

-- Step 1: Rename the column from referral_code to affiliate_code
ALTER TABLE affiliates RENAME COLUMN referral_code TO affiliate_code;

-- Step 2: Update any indexes if they exist (they should automatically update with column rename)
-- Indexes will automatically be renamed when the column is renamed

-- Step 3: Verify the change worked
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'affiliates'
        AND column_name = 'affiliate_code'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE '✅ Column successfully renamed to affiliate_code';
    ELSE
        RAISE EXCEPTION '❌ Column rename failed - affiliate_code column does not exist';
    END IF;

    -- Check that old column doesn't exist
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'affiliates'
        AND column_name = 'referral_code'
    ) INTO column_exists;

    IF NOT column_exists THEN
        RAISE NOTICE '✅ Old referral_code column successfully removed';
    ELSE
        RAISE EXCEPTION '❌ Old referral_code column still exists';
    END IF;
END $$;
