/*
  # Add function to update phase_2_price directly
  
  1. New Functions
    - `update_challenge_phase2_price` - Updates phase_2_price for a challenge
  
  2. Security
    - Function runs with invoker's rights (respects RLS)
    - Only challenge owner can update their challenge
*/

CREATE OR REPLACE FUNCTION update_challenge_phase2_price(
  challenge_id UUID,
  new_price NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE user_challenges
  SET phase_2_price = new_price,
      updated_at = NOW()
  WHERE id = challenge_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION update_challenge_phase2_price IS 'Updates the phase 2 price for a user challenge (owner only)';
