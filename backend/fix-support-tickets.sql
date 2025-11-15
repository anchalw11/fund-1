-- Drop if exists
DROP FUNCTION IF EXISTS insert_ticket_message(uuid, text, boolean, uuid);

-- Create function to insert ticket message
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
  v_result json;
BEGIN
  -- Insert the message
  INSERT INTO ticket_messages (ticket_id, message, is_admin, user_id)
  VALUES (p_ticket_id, p_message, p_is_admin, p_user_id)
  RETURNING id INTO v_message_id;

  -- Update parent ticket timestamp
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = p_ticket_id;

  -- Return the inserted message
  SELECT json_build_object(
    'id', id,
    'ticket_id', ticket_id,
    'message', message,
    'is_admin', is_admin,
    'user_id', user_id,
    'created_at', created_at
  )
  INTO v_result
  FROM ticket_messages
  WHERE id = v_message_id;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_ticket_message(uuid, text, boolean, uuid) TO anon;
