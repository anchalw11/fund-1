-- Create support ticket functions for cjjobdopkkbwexfxwosb database

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
  SELECT row_to_json(t)
  INTO v_ticket
  FROM support_tickets t
  WHERE t.id = p_ticket_id;

  IF v_ticket IS NULL THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.created_at), '[]'::json)
  INTO v_messages
  FROM ticket_messages m
  WHERE m.ticket_id = p_ticket_id;

  SELECT json_build_object(
    'ticket', v_ticket,
    'messages', v_messages
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_support_tickets TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_support_ticket_with_messages TO anon, authenticated;
