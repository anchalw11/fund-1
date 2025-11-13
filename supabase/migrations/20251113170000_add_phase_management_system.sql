-- Add comprehensive phase management system to user_challenges table
-- This migration adds proper phase tracking and management capabilities

-- Add phase column if it doesn't exist (some versions may have current_phase instead)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase') THEN
        ALTER TABLE user_challenges ADD COLUMN phase INTEGER DEFAULT 1;
    END IF;
END $$;

-- Ensure current_phase column exists (for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'current_phase') THEN
        ALTER TABLE user_challenges ADD COLUMN current_phase INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add phase completion tracking columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_1_completed') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_1_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_2_completed') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_2_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_1_completion_date') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_1_completion_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_2_completion_date') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_2_completion_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_1_credentials_sent') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_1_credentials_sent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_challenges'
                   AND column_name = 'phase_2_credentials_sent') THEN
        ALTER TABLE user_challenges ADD COLUMN phase_2_credentials_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing challenges to have proper phase values
UPDATE user_challenges
SET
    phase = COALESCE(current_phase, 1),
    current_phase = COALESCE(current_phase, 1),
    phase_1_completed = CASE
        WHEN status IN ('passed', 'funded') AND current_phase >= 2 THEN TRUE
        ELSE FALSE
    END,
    phase_2_completed = CASE
        WHEN status = 'funded' THEN TRUE
        ELSE FALSE
    END,
    phase_1_credentials_sent = COALESCE(credentials_sent, FALSE),
    phase_2_credentials_sent = CASE
        WHEN current_phase >= 2 THEN COALESCE(credentials_sent, FALSE)
        ELSE FALSE
    END
WHERE phase IS NULL OR current_phase IS NULL;

-- Create function to get user challenges with phase information
CREATE OR REPLACE FUNCTION get_user_challenges_with_phases(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    challenge_type TEXT,
    challenge_type_id UUID,
    account_size NUMERIC,
    amount_paid NUMERIC,
    status TEXT,
    phase INTEGER,
    current_phase INTEGER,
    phase_1_completed BOOLEAN,
    phase_2_completed BOOLEAN,
    phase_1_completion_date TIMESTAMPTZ,
    phase_2_completion_date TIMESTAMPTZ,
    trading_account_id TEXT,
    trading_account_password TEXT,
    trading_account_server TEXT,
    credentials_sent BOOLEAN,
    phase_1_credentials_sent BOOLEAN,
    phase_2_credentials_sent BOOLEAN,
    purchase_date TIMESTAMPTZ,
    challenge_name TEXT,
    challenge_code TEXT,
    phase_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        uc.id,
        uc.user_id,
        uc.challenge_type,
        uc.challenge_type_id,
        uc.account_size,
        uc.amount_paid,
        uc.status,
        COALESCE(uc.phase, uc.current_phase, 1) as phase,
        COALESCE(uc.current_phase, uc.phase, 1) as current_phase,
        COALESCE(uc.phase_1_completed, FALSE) as phase_1_completed,
        COALESCE(uc.phase_2_completed, FALSE) as phase_2_completed,
        uc.phase_1_completion_date,
        uc.phase_2_completion_date,
        uc.trading_account_id,
        uc.trading_account_password,
        uc.trading_account_server,
        COALESCE(uc.credentials_sent, FALSE) as credentials_sent,
        COALESCE(uc.phase_1_credentials_sent, FALSE) as phase_1_credentials_sent,
        COALESCE(uc.phase_2_credentials_sent, FALSE) as phase_2_credentials_sent,
        uc.purchase_date,
        ct.challenge_name,
        ct.challenge_code,
        ct.phase_count
    FROM user_challenges uc
    LEFT JOIN challenge_types ct ON uc.challenge_type_id = ct.id
    WHERE uc.user_id = user_uuid
    ORDER BY uc.purchase_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark phase as completed
CREATE OR REPLACE FUNCTION mark_phase_completed(
    challenge_uuid UUID,
    completed_phase INTEGER,
    completion_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_record RECORD;
    next_phase INTEGER;
BEGIN
    -- Get current challenge
    SELECT * INTO challenge_record
    FROM user_challenges
    WHERE id = challenge_uuid;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update phase completion
    IF completed_phase = 1 THEN
        UPDATE user_challenges
        SET
            phase_1_completed = TRUE,
            phase_1_completion_date = completion_date,
            phase = 2,
            current_phase = 2,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    ELSIF completed_phase = 2 THEN
        UPDATE user_challenges
        SET
            phase_2_completed = TRUE,
            phase_2_completion_date = completion_date,
            phase = 3,
            current_phase = 3,
            status = 'funded',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign phase credentials
CREATE OR REPLACE FUNCTION assign_phase_credentials(
    challenge_uuid UUID,
    phase_number INTEGER,
    mt5_login TEXT,
    mt5_password TEXT,
    mt5_server TEXT,
    account_size_param NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_record RECORD;
BEGIN
    -- Get current challenge
    SELECT * INTO challenge_record
    FROM user_challenges
    WHERE id = challenge_uuid;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update credentials based on phase
    IF phase_number = 1 THEN
        UPDATE user_challenges
        SET
            trading_account_id = mt5_login,
            trading_account_password = mt5_password,
            trading_account_server = mt5_server,
            account_size = COALESCE(account_size_param, account_size),
            phase_1_credentials_sent = TRUE,
            credentials_sent = TRUE,
            phase = 1,
            current_phase = 1,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    ELSIF phase_number = 2 THEN
        UPDATE user_challenges
        SET
            trading_account_id = mt5_login,
            trading_account_password = mt5_password,
            trading_account_server = mt5_server,
            account_size = COALESCE(account_size_param, account_size * 2),
            phase_2_credentials_sent = TRUE,
            credentials_sent = TRUE,
            phase = 2,
            current_phase = 2,
            status = 'active',
            updated_at = NOW()
        WHERE id = challenge_uuid;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_challenges_with_phases(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_phase_completed(UUID, INTEGER, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_phase_credentials(UUID, INTEGER, TEXT, TEXT, TEXT, NUMERIC) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_phase ON user_challenges(phase);
CREATE INDEX IF NOT EXISTS idx_user_challenges_current_phase ON user_challenges(current_phase);
CREATE INDEX IF NOT EXISTS idx_user_challenges_phase_1_completed ON user_challenges(phase_1_completed);
CREATE INDEX IF NOT EXISTS idx_user_challenges_phase_2_completed ON user_challenges(phase_2_completed);

-- Verify the migration worked
DO $$
DECLARE
    phase_column_exists BOOLEAN;
    current_phase_column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_challenges' AND column_name = 'phase'
    ) INTO phase_column_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_challenges' AND column_name = 'current_phase'
    ) INTO current_phase_column_exists;

    IF phase_column_exists AND current_phase_column_exists THEN
        RAISE NOTICE 'SUCCESS: Phase management columns added successfully!';
    ELSE
        RAISE EXCEPTION 'ERROR: Phase management columns were not created properly';
    END IF;
END $$;
