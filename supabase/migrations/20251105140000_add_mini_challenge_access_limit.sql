/*
  # Add Mini-Challenge Access Limit System

  1. Changes
    - Create `mini_challenge_limits` table to track global access count
    - Add trigger to increment counter when users access scanner
    - Prevent access when limit of 100 users is reached

  2. Purpose
    - Limit mini-challenge scanner access to maximum 100 users
    - Track total access attempts with timestamps
    - Provide clear messaging when limit is reached
*/

-- Create table to track mini-challenge access limits
CREATE TABLE IF NOT EXISTS mini_challenge_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_access_count integer NOT NULL DEFAULT 0,
  max_limit integer NOT NULL DEFAULT 100,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert initial record with 0 count and 100 limit
INSERT INTO mini_challenge_limits (total_access_count, max_limit)
VALUES (0, 100)
ON CONFLICT DO NOTHING;

-- Create table to track individual access attempts
CREATE TABLE IF NOT EXISTS mini_challenge_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_ip text,
  accessed_at timestamptz DEFAULT now(),
  granted boolean DEFAULT false
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_mini_challenge_access_logs_granted
  ON mini_challenge_access_logs(granted, accessed_at);

CREATE INDEX IF NOT EXISTS idx_mini_challenge_access_logs_email
  ON mini_challenge_access_logs(user_email);

-- Function to check and increment access count
CREATE OR REPLACE FUNCTION check_mini_challenge_access_limit(user_uuid uuid, user_email text, user_ip text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_limit record;
  access_granted boolean;
  access_count integer;
BEGIN
  -- Get current limit info
  SELECT * INTO current_limit FROM mini_challenge_limits LIMIT 1;

  -- Default to 0 if no record exists
  IF current_limit.total_access_count IS NULL THEN
    current_limit.total_access_count := 0;
  END IF;

  -- Check if under limit
  IF current_limit.total_access_count < current_limit.max_limit THEN
    access_granted := true;
    access_count := current_limit.total_access_count + 1;

    -- Update counter
    UPDATE mini_challenge_limits
    SET total_access_count = access_count,
        last_updated = now()
    WHERE id = current_limit.id;
  ELSE
    access_granted := false;
    access_count := current_limit.total_access_count;
  END IF;

  -- Log the access attempt
  INSERT INTO mini_challenge_access_logs (user_id, user_email, user_ip, granted)
  VALUES (user_uuid, user_email, user_ip, access_granted);

  -- Return result
  RETURN jsonb_build_object(
    'access_granted', access_granted,
    'current_count', access_count,
    'max_limit', current_limit.max_limit,
    'message', CASE
      WHEN access_granted THEN 'Access granted'
      ELSE 'Access limit reached (100 users maximum)'
    END
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_mini_challenge_access_limit(uuid, text, text) TO anon, authenticated;

-- Add RLS policies for security
ALTER TABLE mini_challenge_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_challenge_access_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own access logs
CREATE POLICY "Users can read their own access logs"
  ON mini_challenge_access_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow reading limit info (but no updates)
CREATE POLICY "Anyone can read access limits"
  ON mini_challenge_limits FOR SELECT
  TO authenticated, anon
  USING (true);

-- Comments for documentation
COMMENT ON TABLE mini_challenge_limits IS 'Global counter for mini-challenge access limits (max 100 users)';
COMMENT ON TABLE mini_challenge_access_logs IS 'Log of all mini-challenge access attempts';
COMMENT ON FUNCTION check_mini_challenge_access_limit(uuid, text, text) IS 'Check if user can access mini-challenge and update counter';
