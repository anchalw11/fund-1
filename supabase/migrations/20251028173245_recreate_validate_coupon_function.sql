/*
  # Recreate validate_coupon Function

  Drop and recreate with correct parameter names to avoid ambiguity
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS validate_coupon(TEXT, TEXT);

-- Recreate with prefixed parameter names
CREATE FUNCTION validate_coupon(
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
  -- Find the coupon using table prefix to avoid ambiguity
  SELECT * INTO coupon_record
  FROM coupons
  WHERE coupons.coupon_code = UPPER(p_coupon_code)
    AND coupons.is_active = true
    AND (coupons.valid_from IS NULL OR coupons.valid_from <= NOW())
    AND (coupons.valid_until IS NULL OR coupons.valid_until >= NOW())
    AND (coupons.challenge_type_restriction IS NULL 
         OR coupons.challenge_type_restriction = 'all' 
         OR coupons.challenge_type_restriction = p_challenge_type)
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
    'code', coupon_record.coupon_code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', 0,
    'description', 'Discount applied'
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;