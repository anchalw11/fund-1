/*
  # Add Coupon Usage Increment Function
  
  1. New Functions
    - `increment_coupon_usage` - Increments the times_used counter for a coupon
  
  2. Security
    - Function is SECURITY DEFINER to allow incrementing usage count
    - Only increments for valid, active coupons
*/

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
  SET 
    times_used = COALESCE(times_used, 0) + 1,
    updated_at = NOW()
  WHERE code = coupon_code;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION increment_coupon_usage IS 'Increments the usage count for a coupon code';
