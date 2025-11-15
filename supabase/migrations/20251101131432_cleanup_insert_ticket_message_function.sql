/*
  # Clean up duplicate insert_ticket_message functions

  1. Changes
    - Drop all versions of insert_ticket_message
    - Create single clean version with 4 parameters
    - Returns simple JSON with success, id, created_at
*/

-- Drop all versions (with different parameter counts)
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text, boolean, uuid, uuid);
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text, boolean, uuid);
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text, boolean);
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text);

-- Create single clean version
CREATE FUNCTION insert_ticket_message(
  p_ticket_id uuid,
  p_message text,
  p_is_admin boolean DEFAULT false,
  p_user_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id uuid;
  v_created_at timestamptz;
BEGIN
  -- Insert the message
  INSERT INTO ticket_messages (ticket_id, message, is_admin, user_id)
  VALUES (p_ticket_id, p_message, p_is_admin, p_user_id)
  RETURNING id, created_at INTO v_message_id, v_created_at;

  -- Update parent ticket timestamp
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = p_ticket_id;

  -- Return simple JSON
  RETURN json_build_object(
    'success', true,
    'id', v_message_id,
    'created_at', v_created_at
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO anon;
