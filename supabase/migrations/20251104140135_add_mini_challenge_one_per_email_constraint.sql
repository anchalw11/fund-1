/*
  # Restrict Mini-Challenges to One Per Email

  1. Changes
    - Add `email` column to `mini_challenges` table
    - Add unique constraint on email to prevent multiple free challenges per user
    - Create function to check if user already claimed mini-challenge

  2. Security
    - Only allow one mini-challenge redemption per email address
    - Prevent abuse of free challenge system
*/

-- Add email column to mini_challenges if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mini_challenges' AND column_name = 'email'
  ) THEN
    ALTER TABLE mini_challenges ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Create unique index on email (case-insensitive)
DROP INDEX IF EXISTS mini_challenges_email_unique_idx;
CREATE UNIQUE INDEX mini_challenges_email_unique_idx 
  ON mini_challenges (LOWER(email))
  WHERE email IS NOT NULL AND email != '';

-- Function to check if email already has a mini-challenge
CREATE OR REPLACE FUNCTION check_mini_challenge_eligibility(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_challenge record;
BEGIN
  -- Check if email already has a mini-challenge
  SELECT * INTO existing_challenge
  FROM mini_challenges
  WHERE LOWER(email) = LOWER(user_email)
  LIMIT 1;

  IF existing_challenge.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'message', 'This email has already redeemed a free mini-challenge',
      'existing_challenge_id', existing_challenge.id,
      'claimed_at', existing_challenge.created_at
    );
  END IF;

  RETURN jsonb_build_object(
    'eligible', true,
    'message', 'Email is eligible for mini-challenge'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_mini_challenge_eligibility(text) TO anon, authenticated;

-- Add policy to prevent duplicate mini-challenge inserts
CREATE POLICY "Prevent duplicate mini challenges per email"
  ON mini_challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM mini_challenges mc
      WHERE LOWER(mc.email) = LOWER(mini_challenges.email)
    )
  );