
-- Create a table to store rejected challenges
CREATE TABLE rejected_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_challenge_id UUID,
    user_id UUID,
    challenge_type_id UUID,
    account_size NUMERIC,
    amount_paid NUMERIC,
    status VARCHAR(255),
    purchase_date TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    rejection_reason TEXT,
    admin_note TEXT
);

-- Function to move a rejected challenge to the rejected_challenges table
CREATE OR REPLACE FUNCTION move_to_rejected()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO rejected_challenges (
            original_challenge_id,
            user_id,
            challenge_type_id,
            account_size,
            amount_paid,
            status,
            purchase_date,
            rejection_reason,
            admin_note
        )
        VALUES (
            NEW.id,
            NEW.user_id,
            NEW.challenge_type_id,
            NEW.account_size,
            NEW.amount_paid,
            NEW.status,
            NEW.purchase_date,
            NEW.admin_note, -- Assuming the rejection reason is in the admin_note
            NEW.admin_note
        );
        -- Optionally, you can delete the record from the original table
        -- DELETE FROM user_challenges WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the function after an update on user_challenges
CREATE TRIGGER after_challenge_rejected
AFTER UPDATE ON user_challenges
FOR EACH ROW
EXECUTE FUNCTION move_to_rejected();
