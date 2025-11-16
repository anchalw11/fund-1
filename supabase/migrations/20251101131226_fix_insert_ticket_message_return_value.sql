/*
  # Fix insert_ticket_message function return value

  1. Changes
    - Return simple JSON structure instead of full row
    - Avoids PostgREST column cache validation issues
    - Returns only essential fields: id, created_at, success status
*/

-- Drop existing function
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text, boolean, uuid);

-- Recreate with simpler return value
CREATE OR REPLACE FUNCTION insert_ticket_message(
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

  -- Return simple JSON (avoids PostgREST column cache issues)
  RETURN json_build_object(
    'success', true,
    'id', v_message_id,
    'created_at', v_created_at
  );
END;
$$;

-- Ensure permissions
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO anon;
