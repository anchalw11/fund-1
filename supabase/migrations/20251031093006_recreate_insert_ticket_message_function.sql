/*
  # Recreate function to insert ticket messages

  1. Changes
    - Drop existing function
    - Create new function with proper return type
    - Handles message insertion safely

  2. Security
    - SECURITY DEFINER bypasses RLS
    - Available to both authenticated and anon users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_ticket_message(UUID, TEXT, BOOLEAN, UUID, UUID);

-- Create function to insert ticket message
CREATE OR REPLACE FUNCTION insert_ticket_message(
  p_ticket_id UUID,
  p_message TEXT,
  p_is_admin BOOLEAN DEFAULT false,
  p_user_id UUID DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Insert the message and return as JSON
  INSERT INTO ticket_messages (
    ticket_id,
    message,
    is_admin,
    user_id,
    admin_id
  )
  VALUES (
    p_ticket_id,
    p_message,
    p_is_admin,
    p_user_id,
    p_admin_id
  )
  RETURNING json_build_object(
    'id', id,
    'ticket_id', ticket_id,
    'user_id', user_id,
    'admin_id', admin_id,
    'message', message,
    'is_admin', is_admin,
    'created_at', created_at
  ) INTO v_result;

  -- Update the ticket's updated_at timestamp
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = p_ticket_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_ticket_message TO authenticated, anon;
