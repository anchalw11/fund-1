-- Fix validate_coupon function to use correct column names
-- The function was referencing wrong column names

DROP FUNCTION IF EXISTS validate_coupon(TEXT, TEXT);

CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code TEXT,
  p_challenge_type TEXT DEFAULT 'all'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Find the coupon using correct column names
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = UPPER(p_coupon_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (challenge_type = 'all' OR challenge_type = p_challenge_type OR p_challenge_type = 'all')
  LIMIT 1;

  -- Check if coupon was found
  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    result := json_build_object(
      'valid', false,
      'message', 'Coupon has reached its usage limit'
    );
    RETURN result;
  END IF;

  -- Return valid coupon
  result := json_build_object(
    'valid', true,
    'message', 'Coupon is valid',
    'code', coupon_record.code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', 0
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;

-- Also fix the increment_coupon_usage function
DROP FUNCTION IF EXISTS increment_coupon_usage(TEXT);

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_exists BOOLEAN;
BEGIN
  -- Check if coupon exists and is active
  SELECT EXISTS (
    SELECT 1 FROM coupons
    WHERE code = coupon_code
      AND is_active = TRUE
  ) INTO coupon_exists;

  IF NOT coupon_exists THEN
    RETURN FALSE;
  END IF;

  -- Increment usage count
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE code = coupon_code;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_coupon_usage(TEXT) TO anon, authenticated;
