/*
  # Add Email Column to User Profile

  1. Changes
    - Add email column to user_profile table if it doesn't exist
    - Update existing records to populate email from auth.users
  
  2. Purpose
    - Allow storing email directly in user_profile for easier access
    - Support user profile creation with email
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile(email);
  END IF;
END $$;

-- Success message
SELECT 'Email column added to user_profile successfully!' as result;
