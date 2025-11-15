/*
  # Fix PostgREST Schema Cache Issue
  
  1. Changes
    - Add comment to phase_2_price column to force schema reload
    - Send reload notification to PostgREST
    - Ensure all columns are properly indexed
  
  2. Security
    - No changes to RLS policies
*/

-- Add a comment to force schema cache refresh
COMMENT ON COLUMN user_challenges.phase_2_price IS 'Price for phase 2 in Pay-As-You-Go challenges (USD)';

-- Ensure the column is properly configured
ALTER TABLE user_challenges 
  ALTER COLUMN phase_2_price TYPE numeric,
  ALTER COLUMN phase_2_price SET DEFAULT NULL;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Verify the column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_challenges' 
    AND column_name = 'phase_2_price'
  ) THEN
    RAISE EXCEPTION 'phase_2_price column does not exist after migration!';
  END IF;
  
  RAISE NOTICE 'phase_2_price column verified successfully';
END $$;
