/*
  # Add user email and name fields to support tickets

  1. Changes
    - Add `user_email` column to support_tickets for non-authenticated users
    - Add `user_name` column to support_tickets for non-authenticated users
    - Make user_id nullable since contact form users may not be logged in
    
  2. Notes
    - Allows contact form submissions from non-registered users
    - Either user_id OR user_email must be present
*/

-- Add user_email and user_name columns
ALTER TABLE support_tickets 
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Make user_id nullable
ALTER TABLE support_tickets 
  ALTER COLUMN user_id DROP NOT NULL;
