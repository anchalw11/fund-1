/*
  # Add Mini-Challenge Tracking to User Challenges Table

  1. Changes
    - Add `is_mini_challenge` boolean column to track free mini-challenges
    - Add `user_email` text column to store email for duplicate checking
    - Create index for fast case-insensitive email lookups on mini-challenges
  
  2. Purpose
    - Track mini-challenges within the existing user_challenges table
    - Enable one-per-email restriction for free mini-challenges
    - Optimize query performance with partial index
  
  3. Security
    - Uses existing RLS policies on user_challenges table
    - Case-insensitive email matching prevents duplicates
*/

-- Add columns to user_challenges table
ALTER TABLE user_challenges 
  ADD COLUMN IF NOT EXISTS is_mini_challenge boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_email text;

-- Create index for fast email lookups on mini challenges only
CREATE INDEX IF NOT EXISTS idx_user_challenges_mini_email 
  ON user_challenges(LOWER(user_email)) 
  WHERE is_mini_challenge = true;

-- Add comment for documentation
COMMENT ON COLUMN user_challenges.is_mini_challenge IS 'Indicates if this is a free mini-challenge (one per email allowed)';
COMMENT ON COLUMN user_challenges.user_email IS 'User email stored for mini-challenge duplicate checking';
