/*
  # Add User Fields to Support Tickets

  1. Changes
    - Add user_email column to support_tickets table
    - Add user_name column to support_tickets table
  
  2. Purpose
    - Allow contact form submissions from non-authenticated users
    - Store submitter information for admin reference
*/

-- Add user_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN user_email TEXT;
  END IF;
END $$;

-- Add user_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN user_name TEXT;
  END IF;
END $$;
