/*
  # Add function to fetch ticket messages (bypasses PostgREST cache)

  1. New Functions
    - `get_ticket_messages` - Returns messages for a ticket
      - Bypasses PostgREST schema cache issues
      - Returns all message fields as JSON array
      - Parameters: ticket_id
  
  2. Security
    - Function runs with SECURITY DEFINER
    - Accessible to authenticated and anonymous users
*/

-- Create function to get ticket messages
CREATE OR REPLACE FUNCTION get_ticket_messages(p_ticket_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Get all messages for the ticket
  SELECT json_agg(
    json_build_object(
      'id', id,
      'ticket_id', ticket_id,
      'message', message,
      'is_admin', is_admin,
      'user_id', user_id,
      'created_at', created_at
    ) ORDER BY created_at ASC
  )
  INTO v_result
  FROM ticket_messages
  WHERE ticket_id = p_ticket_id;

  -- Return empty array if no messages
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_ticket_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ticket_messages(uuid) TO anon;
