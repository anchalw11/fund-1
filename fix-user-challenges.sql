-- Add the missing challenge_type column to the user_challenges table
ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT;
