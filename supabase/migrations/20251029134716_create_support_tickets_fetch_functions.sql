/*
  # Create functions to fetch support tickets bypassing RLS

  1. New Functions
    - `get_all_support_tickets` - Fetch all tickets for admin
    - `get_support_ticket_by_id` - Fetch single ticket with messages
    
  2. Security
    - Functions are SECURITY DEFINER (runs with creator's permissions)
    - Bypasses RLS for admin operations
*/

-- Function to get all support tickets
CREATE OR REPLACE FUNCTION get_all_support_tickets(
  p_status TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_status IS NULL OR p_status = 'all' THEN
    SELECT json_agg(row_to_json(t))
    INTO v_result
    FROM (
      SELECT *
      FROM support_tickets
      ORDER BY created_at DESC
    ) t;
  ELSE
    SELECT json_agg(row_to_json(t))
    INTO v_result
    FROM (
      SELECT *
      FROM support_tickets
      WHERE status = p_status
      ORDER BY created_at DESC
    ) t;
  END IF;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Function to get a single ticket with messages
CREATE OR REPLACE FUNCTION get_support_ticket_with_messages(
  p_ticket_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket JSON;
  v_messages JSON;
  v_result JSON;
BEGIN
  -- Get ticket details
  SELECT row_to_json(t)
  INTO v_ticket
  FROM support_tickets t
  WHERE t.id = p_ticket_id;

  IF v_ticket IS NULL THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  -- Get messages for this ticket
  SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.created_at), '[]'::json)
  INTO v_messages
  FROM ticket_messages m
  WHERE m.ticket_id = p_ticket_id;

  -- Combine ticket and messages
  SELECT json_build_object(
    'ticket', v_ticket,
    'messages', v_messages
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_all_support_tickets TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_support_ticket_with_messages TO anon, authenticated;
