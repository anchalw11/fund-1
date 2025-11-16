-- Add FREETRIAL100 coupon for competition purchases (makes price $0)
-- This coupon is hidden and provides 100% discount for competition entries

INSERT INTO coupons (code, discount_percent, challenge_type, is_active, max_uses, expires_at, description)
VALUES ('FREETRIAL100', 100, 'all', true, NULL, NULL, 'Hidden coupon for free competition entry')
ON CONFLICT (code) DO UPDATE SET
  discount_percent = 100,
  challenge_type = 'all',
  is_active = true,
  expires_at = NULL,
  description = 'Hidden coupon for free competition entry';

-- Ensure the coupon validation function works correctly
GRANT EXECUTE ON FUNCTION validate_coupon(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_coupon(text, text) TO anon;

-- Verify the coupon exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM coupons WHERE code = 'FREETRIAL100' AND discount_percent = 100 AND is_active = true) THEN
    RAISE NOTICE 'SUCCESS: FREETRIAL100 coupon is active and provides 100%% discount!';
  ELSE
    RAISE EXCEPTION 'ERROR: FREETRIAL100 coupon was not created properly';
  END IF;
END $$;
