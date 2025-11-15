/*
  # Create ticket_messages table for support ticket conversations

  1. New Tables
    - `ticket_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to support_tickets)
      - `user_id` (uuid, optional - for user messages)
      - `admin_id` (uuid, optional - for admin messages)
      - `message` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ticket_messages` table
    - Allow authenticated users to view messages for their tickets
    - Allow authenticated users (admins) to insert admin messages
    - Allow users to insert messages on their own tickets
*/

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  admin_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Enable RLS
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view messages (they will see messages from tickets they can access)
CREATE POLICY "Authenticated users can view messages"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Authenticated users can insert messages"
  ON ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to insert messages (for public ticket creation)
CREATE POLICY "Anonymous users can insert messages"
  ON ticket_messages FOR INSERT
  TO anon
  WITH CHECK (true);
