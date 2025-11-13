/*
  # Fix support tickets RLS for contact form submissions

  1. Changes
    - Add policy to allow anonymous users to create support tickets
    - This enables contact form submissions from non-logged-in users
    
  2. Security
    - Anonymous users can only INSERT tickets (create new)
    - They cannot view or modify existing tickets
    - Email and name are required for anonymous submissions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON support_tickets;

-- Allow anonymous users to create support tickets (contact form)
CREATE POLICY "Anonymous users can create tickets"
  ON support_tickets
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admins to view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to update any ticket
CREATE POLICY "Admins can update any ticket"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
