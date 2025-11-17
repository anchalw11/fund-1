-- ===================================================
-- Assign Affiliate Codes to All Users (10% Commission)
-- ===================================================

-- This script generates unique affiliate codes for all users who don't have one
-- Commission rate is set to 10%
-- Codes are generated using the same logic as the backend

DO $$
DECLARE
    user_record RECORD;
    generated_code TEXT;
    code_counter INTEGER := 0;
BEGIN
    -- Loop through all users who don't have affiliate codes
    FOR user_record IN
        SELECT
            up.user_id,
            up.first_name,
            up.last_name,
            up.friendly_id,
            au.email
        FROM user_profile up
        JOIN auth.users au ON au.id = up.user_id
        WHERE NOT EXISTS (
            SELECT 1 FROM affiliates a WHERE a.user_id = up.user_id
        )
    LOOP
        -- Generate affiliate code using same logic as backend
        generated_code := '';

        -- Try to use first_name + last_name (first 3 chars each)
        IF user_record.first_name IS NOT NULL AND user_record.last_name IS NOT NULL THEN
            generated_code := UPPER(SUBSTRING(user_record.first_name, 1, 3) || SUBSTRING(user_record.last_name, 1, 3));
        ELSIF user_record.friendly_id IS NOT NULL THEN
            -- Use first 6 chars of friendly_id
            generated_code := UPPER(SUBSTRING(user_record.friendly_id, 1, 6));
        ELSE
            -- Fallback: USER + counter
            generated_code := 'USER' || code_counter;
        END IF;

        -- Remove non-alphanumeric chars and ensure at least some base
        generated_code := regexp_replace(generated_code, '[^A-Z0-9]', '', 'g');
        IF length(generated_code) < 3 THEN
            generated_code := generated_code || 'USR';
        END IF;

        -- Add 4 random digits (1000-9999)
        generated_code := generated_code || (1000 + floor(random() * 9000))::TEXT;

        -- Ensure uniqueness by checking against existing codes
        WHILE EXISTS (SELECT 1 FROM affiliates WHERE affiliate_code = generated_code) LOOP
            -- If collision, add a random letter at the end
            generated_code := SUBSTRING(generated_code, 1, length(generated_code) - 4) ||
                             chr(floor(random() * 26 + 65)::int) ||
                             (1000 + floor(random() * 9000))::TEXT;
        END LOOP;

        -- Insert the affiliate record
        INSERT INTO affiliates (
            user_id,
            affiliate_code,
            commission_rate,
            total_referrals,
            total_earnings,
            available_balance,
            status
        ) VALUES (
            user_record.user_id,
            generated_code,
            10.00,  -- 10% commission
            0,       -- total_referrals
            0,       -- total_earnings
            0,       -- available_balance
            'active'
        );

        -- Log progress
        RAISE NOTICE 'Created affiliate code "%" for user % (%)',
            generated_code, user_record.user_id, COALESCE(user_record.email, 'no-email');

        code_counter := code_counter + 1;
    END LOOP;

    RAISE NOTICE '✅ Successfully assigned affiliate codes to % users', code_counter;
END $$;
