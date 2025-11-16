/*
  # Fix validate_coupon Function

  The function was using wrong column names. This migration fixes:
  1. Changes 'code' to 'coupon_code'
  2. Changes 'applicable_to' to 'challenge_type_restriction'
  3. Changes 'used_count' to 'current_uses'
*/

CREATE OR REPLACE FUNCTION validate_coupon(
  coupon_code TEXT,
  challenge_type TEXT DEFAULT 'all'
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
  WHERE coupon_code = UPPER(validate_coupon.coupon_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (challenge_type_restriction IS NULL OR challenge_type_restriction = 'all' OR challenge_type_restriction = challenge_type)
  LIMIT 1;

  -- Check if coupon was found
  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  -- Check usage limit (current_uses not used_count)
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
    'code', coupon_record.coupon_code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', 0,
    'description', 'Discount applied'
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;