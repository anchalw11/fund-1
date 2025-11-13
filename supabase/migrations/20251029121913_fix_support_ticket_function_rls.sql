/*
  # Fix support ticket creation function to properly bypass RLS

  1. Changes
    - Recreate function with proper RLS bypass
    - Set search_path for security
    
  2. Security
    - Function runs with definer's rights
    - Bypasses RLS for insert only
*/

-- Drop and recreate the function with proper settings
DROP FUNCTION IF EXISTS create_support_ticket;

CREATE OR REPLACE FUNCTION create_support_ticket(
  p_subject TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal',
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_id UUID;
  v_result JSON;
BEGIN
  -- Validate required fields
  IF p_subject IS NULL OR p_subject = '' THEN
    RAISE EXCEPTION 'Subject is required';
  END IF;
  
  IF p_description IS NULL OR p_description = '' THEN
    RAISE EXCEPTION 'Description is required';
  END IF;

  -- Insert the ticket (this will bypass RLS because of SECURITY DEFINER)
  INSERT INTO support_tickets (
    subject,
    description,
    category,
    priority,
    status,
    user_id,
    user_email,
    user_name,
    created_at,
    updated_at
  ) VALUES (
    p_subject,
    p_description,
    COALESCE(p_category, 'general'),
    COALESCE(p_priority, 'normal'),
    'open',
    p_user_id,
    p_user_email,
    p_user_name,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_ticket_id;

  -- Return the created ticket as JSON
  SELECT json_build_object(
    'id', id,
    'subject', subject,
    'description', description,
    'category', category,
    'priority', priority,
    'status', status,
    'user_id', user_id,
    'user_email', user_email,
    'user_name', user_name,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM support_tickets
  WHERE id = v_ticket_id;

  RETURN v_result;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION create_support_ticket TO anon, authenticated;
